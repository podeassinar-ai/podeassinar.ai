import { pillars } from '@ui/constants/home-content';

export function PillarsSection() {
    return (
        <div className="mb-24 relative">
            {/* Decorative Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-gray-50/50 to-transparent -z-10 rounded-full blur-3xl"></div>

            <div className="text-center mb-16">
                <span className="text-primary font-bold tracking-widest uppercase text-xs font-mono mb-2 block">Por que usar?</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Muito mais que um check-list</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
                {pillars.map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                            {item.icon}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
