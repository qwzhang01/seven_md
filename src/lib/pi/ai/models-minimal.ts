/**
 * Minimal model definitions for Seven Markdown.
 * Replaces the 416KB models.generated.ts with only the models we actually use.
 * Users configure their own models via settings; these are just defaults.
 */

import type { Api, Model } from "./types.ts";

export const MODELS: Record<string, Record<string, Model<Api>>> = {
	openai: {
		"gpt-4o": {
			id: "gpt-4o",
			name: "GPT-4o",
			api: "openai-completions",
			provider: "openai",
			baseUrl: "https://api.openai.com/v1",
			reasoning: false,
			input: ["text", "image"],
			cost: { input: 2.5, output: 10, cacheRead: 1.25, cacheWrite: 2.5 },
			contextWindow: 128000,
			maxTokens: 16384,
		},
		"gpt-4o-mini": {
			id: "gpt-4o-mini",
			name: "GPT-4o Mini",
			api: "openai-completions",
			provider: "openai",
			baseUrl: "https://api.openai.com/v1",
			reasoning: false,
			input: ["text", "image"],
			cost: { input: 0.15, output: 0.6, cacheRead: 0.075, cacheWrite: 0.15 },
			contextWindow: 128000,
			maxTokens: 16384,
		},
		"o3-mini": {
			id: "o3-mini",
			name: "o3-mini",
			api: "openai-completions",
			provider: "openai",
			baseUrl: "https://api.openai.com/v1",
			reasoning: true,
			input: ["text"],
			cost: { input: 1.1, output: 4.4, cacheRead: 0.55, cacheWrite: 1.1 },
			contextWindow: 200000,
			maxTokens: 100000,
		},
	},
	deepseek: {
		"deepseek-chat": {
			id: "deepseek-chat",
			name: "DeepSeek V3",
			api: "openai-completions",
			provider: "deepseek",
			baseUrl: "https://api.deepseek.com/v1",
			reasoning: false,
			input: ["text"],
			cost: { input: 0.27, output: 1.1, cacheRead: 0.07, cacheWrite: 0.27 },
			contextWindow: 64000,
			maxTokens: 8192,
		},
		"deepseek-reasoner": {
			id: "deepseek-reasoner",
			name: "DeepSeek R1",
			api: "openai-completions",
			provider: "deepseek",
			baseUrl: "https://api.deepseek.com/v1",
			reasoning: true,
			input: ["text"],
			cost: { input: 0.55, output: 2.19, cacheRead: 0.14, cacheWrite: 0.55 },
			contextWindow: 64000,
			maxTokens: 8192,
		},
	},
	openrouter: {
		"anthropic/claude-sonnet-4-20250514": {
			id: "anthropic/claude-sonnet-4-20250514",
			name: "Claude Sonnet 4",
			api: "openai-completions",
			provider: "openrouter",
			baseUrl: "https://openrouter.ai/api/v1",
			reasoning: true,
			input: ["text", "image"],
			cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
			contextWindow: 200000,
			maxTokens: 16000,
		},
		"anthropic/claude-3.5-haiku-20241022": {
			id: "anthropic/claude-3.5-haiku-20241022",
			name: "Claude 3.5 Haiku",
			api: "openai-completions",
			provider: "openrouter",
			baseUrl: "https://openrouter.ai/api/v1",
			reasoning: false,
			input: ["text", "image"],
			cost: { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite: 1 },
			contextWindow: 200000,
			maxTokens: 8192,
		},
	},
};
