// This file now re-exports from the modular admin action files.
// This maintains backwards compatibility with existing imports.
// Note: 'use server' is NOT used here because barrel re-exports are not allowed.
// Each sub-module has its own 'use server' directive.

export * from './admin';
