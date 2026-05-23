/**
 * Stub: Skills module (file-system dependent features removed for browser compatibility).
 * Only exports the formatSkillInvocation helper used by agent-harness.
 */

import type { Skill } from "./types.ts";

/** Format a skill invocation prompt, optionally appending additional user instructions. */
export function formatSkillInvocation(skill: Skill, additionalInstructions?: string): string {
	const skillBlock = `<skill name="${skill.name}">\n${skill.content}\n</skill>`;
	return additionalInstructions ? `${skillBlock}\n\n${additionalInstructions}` : skillBlock;
}
