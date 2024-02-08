import {
	APIModalSubmitInteraction,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	RESTPostAPIWebhookWithTokenJSONBody,
	RouteBases,
	Routes,
} from 'discord-api-types/v10';
import { respond, respondWithMessage } from '../utils/respond';
import runAI from '../utils/run-ai';
import { Env } from '..';

export default async function handleModalSubmit(interaction: APIModalSubmitInteraction, env: Env, ctx: ExecutionContext) {
	if (interaction.data.custom_id !== 'action:retry') {
		return respondWithMessage({
			content: 'Unknown modal interaction.',
			flags: MessageFlags.Ephemeral,
		});
	}

	const prompt: string = interaction.data.components[0].components[0].value;
	if (!prompt) {
		return respondWithMessage({
			content: 'No prompt?',
			flags: MessageFlags.Ephemeral,
		});
	}

	ctx.waitUntil(
		(async () => {
			const start = Date.now();
			const response = await runAI(env.AI, prompt);
			console.log(response.response)
			const responseText = response.response;
			console.log(responseText);
			const time = Date.now() - start;

			const messagePayload = JSON.stringify({
				content: `Result for your prompt: ${responseText}\nProcessing time: ${Math.round(time / 100) / 10}s`,
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								custom_id: 'action:retry',
								emoji: {
									name: '🔀',
								},
								label: 'Remix',
								style: ButtonStyle.Secondary,
								type: ComponentType.Button,
							},
						],
					},
				],
			} as RESTPostAPIWebhookWithTokenJSONBody);

			console.log(messagePayload);

			console.log('RETURNING RESPONSE');
			const res = await fetch(`${RouteBases.api}${Routes.webhookMessage(env.appID, interaction.token, '@original')}`, {
				method: 'PATCH',
				body: messagePayload,
				headers: {
					'Content-Type': 'application/json',
				},
			});
			console.log(`Response: ${res}`);
			console.log(`RESPONSE STATUS: ${res.status}`);

			if (!res.ok) {
				const text = await res.text().catch(() => 'failed to get status text');
				throw new Error(text);
			}
		})()
	);

	return respond({
		type: InteractionResponseType.DeferredChannelMessageWithSource,
	});
}
