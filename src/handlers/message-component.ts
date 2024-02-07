import {
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	TextInputStyle,
	type APIMessageComponentInteraction,
} from 'discord-api-types/v10';
import { Env } from '..';
import { respond, respondWithMessage } from '../utils/respond';

export default async function handleMessageCommand(interaction: APIMessageComponentInteraction, _env: Env, _ctx: ExecutionContext) {
	if (interaction.data.component_type !== ComponentType.Button) {
		return respondWithMessage({
			content: 'Unexpected Interaction type',
			flags: MessageFlags.Ephemeral,
		});
	}

	if (interaction.data.custom_id !== 'action:retry') {
		return respondWithMessage({
			content: 'Unknown Button',
			flags: MessageFlags.Ephemeral,
		});
	}

	const prompt = interaction.message.content;

	if (!prompt) {
		return respondWithMessage({
			content: 'No prompt?',
			flags: MessageFlags.Ephemeral,
		});
	}

	return respond({
		type: InteractionResponseType.Modal,
		data: {
			custom_id: 'action:retry',
			title: 'LearnBuddy',
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.TextInput,
							style: TextInputStyle.Paragraph,
							custom_id: 'prompt',
							label: 'Prompt',
							value: prompt,
							max_length: 256,
							min_length: 6,
							required: true,
							placeholder: 'What is Generative AI?',
						},
					],
				},
			],
		},
	});
}
