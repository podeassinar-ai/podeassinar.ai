import requests
from bs4 import BeautifulSoup
import re
import os

def scrape_docs(url):
    print(f"Scraping {url}...")
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'lxml')
    
    params = []
    tables = soup.find_all('table')
    for table in tables:
        headers = [th.get_text().strip().lower() for th in table.find_all('th')]
        if 'parameter' in headers or 'field' in headers:
            rows = table.find_all('tr')[1:]
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    name = cols[0].get_text().strip()
                    name = re.sub(r'[^a-zA-Z0-9_]', '', name)
                    required = '✓' in row.get_text() or 'required' in row.get_text().lower()
                    params.append({'name': name, 'required': required})
        
    return params

def analyze_ts_code(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    customer_match = re.search(r'this\.client\.customers\.create\(\s*\{(.*?)\}\s*\)', content, re.DOTALL)
    customer_fields = []
    if customer_match:
        customer_block = customer_match.group(1)
        keys = re.findall(r'(\w+)\s*:', customer_block)
        customer_fields = keys

    checkout_match = re.search(r'this\.client\.checkouts\.create\(\s*\{(.*?)\}\s*\)', content, re.DOTALL)
    checkout_fields = []
    if checkout_match:
        checkout_block = checkout_match.group(1)
        keys = re.findall(r'(\w+)\s*:', checkout_block)
        checkout_fields = keys
    
    implemented_methods = []
    method_patterns = [
        (r'async\s+getCheckout\s*\(', 'getCheckout'),
        (r'async\s+listCheckouts\s*\(', 'listCheckouts'),
        (r'async\s+checkPixStatus\s*\(', 'checkPixStatus'),
        (r'async\s+simulatePixPayment\s*\(', 'simulatePixPayment'),
        (r'async\s+getStoreInfo\s*\(', 'getStoreInfo'),
        (r'async\s+getRevenueMetrics\s*\(', 'getRevenueMetrics'),
        (r'async\s+refund\s*\(', 'refund'),
    ]
    
    for pattern, method_name in method_patterns:
        if re.search(pattern, content):
            implemented_methods.append(method_name)
    
    sdk_calls = {
        'checkouts.get': bool(re.search(r'this\.client\.checkouts\.get\(', content)),
        'checkouts.list': bool(re.search(r'this\.client\.checkouts\.list\(', content)),
        'pix.status': bool(re.search(r'this\.client\.pix\.status\(', content)),
        'pix.simulate': bool(re.search(r'this\.client\.pix\.simulate\(', content)),
        'store.get': bool(re.search(r'this\.client\.store\.get\(', content)),
        'mrr.merchant': bool(re.search(r'this\.client\.mrr\.merchant\(', content)),
    }
        
    return {
        'customer': customer_fields,
        'checkout': checkout_fields,
        'full_content': content,
        'implemented_methods': implemented_methods,
        'sdk_calls': sdk_calls
    }

def validate():
    ts_file = "src/infrastructure/services/abacate-pay-gateway.ts"
    
    expected_customer = [
        {'name': 'name', 'required': True},
        {'name': 'cellphone', 'required': True},
        {'name': 'email', 'required': True},
        {'name': 'taxId', 'required': True}
    ]
    
    expected_billing = [
        {'name': 'frequency', 'required': True},
        {'name': 'methods', 'required': True},
        {'name': 'products', 'required': True},
        {'name': 'returnUrl', 'required': True},
        {'name': 'completionUrl', 'required': True},
        {'name': 'customerId', 'required': False},
        {'name': 'externalId', 'required': False},
        {'name': 'metadata', 'required': False}
    ]
    
    required_methods = [
        'getCheckout',
        'listCheckouts', 
        'checkPixStatus',
        'simulatePixPayment',
        'getStoreInfo',
        'getRevenueMetrics',
    ]
    
    required_sdk_calls = [
        'checkouts.get',
        'checkouts.list',
        'pix.status',
        'pix.simulate',
        'store.get',
        'mrr.merchant',
    ]

    code_analysis = analyze_ts_code(ts_file)
    
    print("\n=== AbacatePay Validation Report ===\n")
    
    print("--- Customer Creation ---")
    missing_customer = []
    for field in expected_customer:
        if field['required'] and field['name'] not in code_analysis['customer']:
            missing_customer.append(field['name'])
    
    if not missing_customer:
        print("[PASS] All mandatory customer fields present.")
    else:
        print(f"[FAIL] Missing mandatory customer fields: {', '.join(missing_customer)}")
    
    if 'cellphone' in code_analysis['customer']:
        if re.search(r'cellphone\s*:\s*\'\'', code_analysis['full_content']):
            print("[WARN] 'cellphone' is mandatory but sent as an empty string.")

    print("\n--- Billing/Checkout Creation ---")
    
    sdk_to_api = {'items': 'products'}
    actual_billing_api_names = [sdk_to_api.get(f, f) for f in code_analysis['checkout']]
    
    missing_billing = []
    for field in expected_billing:
        if field['required'] and field['name'] not in actual_billing_api_names:
            missing_billing.append(field['name'])
            
    if not missing_billing:
        print("[PASS] All mandatory billing fields present.")
    else:
        print(f"[FAIL] Missing mandatory billing fields: {', '.join(missing_billing)}")
        if 'products' in missing_billing and 'items' in code_analysis['checkout']:
            print("       (Note: Code uses 'items', but API docs specify 'products'. Check if SDK maps this.)")

    print("\n--- Additional API Routes ---")
    
    missing_methods = []
    for method in required_methods:
        if method not in code_analysis['implemented_methods']:
            missing_methods.append(method)
    
    if not missing_methods:
        print("[PASS] All required gateway methods implemented.")
    else:
        print(f"[FAIL] Missing gateway methods: {', '.join(missing_methods)}")

    print("\n--- SDK Integration ---")
    
    missing_sdk = []
    for call in required_sdk_calls:
        if not code_analysis['sdk_calls'].get(call, False):
            missing_sdk.append(call)
    
    if not missing_sdk:
        print("[PASS] All required SDK calls present.")
    else:
        print(f"[FAIL] Missing SDK calls: {', '.join(missing_sdk)}")

    print("\n=== Summary ===")
    print(f"Customer fields: {code_analysis['customer']}")
    print(f"Checkout fields: {code_analysis['checkout']}")
    print(f"Implemented methods: {code_analysis['implemented_methods']}")
    print(f"SDK calls present: {[k for k, v in code_analysis['sdk_calls'].items() if v]}")

if __name__ == "__main__":
    validate()
