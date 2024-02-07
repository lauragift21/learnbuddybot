import { APIInteractionResponse, APIInteractionResponseCallbackData } from 'discord-api-types/v10';

export const respond = (response: APIInteractionResponse) => {
	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
};

export const respondWithMessage = (data: APIInteractionResponseCallbackData) => respond({ type: 4, data });
