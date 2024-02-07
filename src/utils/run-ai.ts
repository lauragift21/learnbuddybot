import { Ai } from '@cloudflare/ai';

export default async function runAI(binding: any, message: string) {
	const ai = new Ai(binding);

	const messages = [
		{ role: 'system', content: 'You are a friendly assistant' },
		{ role: 'user', content: message },
	];

	const response = await ai.run('@cf/meta/llama-2-7b-chat-fp16', {
		messages,
	});

	console.log('AI run was successful!');
	console.log('Response:', response);

	return response;
}
