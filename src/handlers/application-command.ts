import {
	APIApplicationCommandInteraction,
	APIApplicationCommandInteractionDataStringOption,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	RESTPostAPIWebhookWithTokenJSONBody,
	RouteBases,
	Routes,
} from 'discord-api-types/v10';
import type { Env } from '..';
import runAI from '../utils/run-ai';
import { respond, respondWithMessage } from '../utils/respond';

export default async function handleApplicationCommand(interaction: APIApplicationCommandInteraction, env: Env, ctx: ExecutionContext) {
	if (interaction.data.type !== ApplicationCommandType.ChatInput) {
		return respondWithMessage({
			content: 'Unexpected Interaction Type',
		});
	}

	const option = interaction.data.options?.find((c) => c.name === 'prompt' && c.type === ApplicationCommandOptionType.String) as
		| APIApplicationCommandInteractionDataStringOption
		| undefined;

	if (!option) {
		return respondWithMessage({
			content: 'No Prompt entered!',
			flags: MessageFlags.Ephemeral,
		});
	}

	ctx.waitUntil(
		(async () => {
			const start = Date.now();
			const response = await runAI(env.AI, option.value);
			console.log(response);
			console.log(...response);
			console.log(response.message);
			const time = Date.now() - start;
			const messagePayload = JSON.stringify({
				content: `Result for your prompt: ${response}\nProcessing time: ${Math.round(time / 100) / 10}s`,
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

			console.log('RETURNING RESPONSE');
			const res = await fetch(`${RouteBases.api}${Routes.webhookMessage(env.appID, interaction.token, '@original')}`, {
				method: 'PATCH',
				body: messagePayload,
				headers: {
					'Content-Type': 'application/json'
				}
			});
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
