'use server';

/**
 * @fileOverview This file defines a Genkit flow to enhance the quality and visibility of menu images for a canteen tablet UI.
 * It uses the Gemini 2.5 Flash Image model for image enhancement.
 *
 * @interface EnhanceMenuImagesInput - Defines the input schema for the enhanceMenuImages flow.
 * @interface EnhanceMenuImagesOutput - Defines the output schema for the enhanceMenuImages flow.
 * @function enhanceMenuImages - The main function to trigger the image enhancement flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceMenuImagesInputSchema = z.object({
  menuItemImage: z
    .string()
    .describe(
      "A menu item image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhanceMenuImagesInput = z.infer<typeof EnhanceMenuImagesInputSchema>;

const EnhanceMenuImagesOutputSchema = z.object({
  enhancedMenuItemImage: z
    .string()
    .describe('The enhanced menu item image as a data URI.'),
});
export type EnhanceMenuImagesOutput = z.infer<typeof EnhanceMenuImagesOutputSchema>;

export async function enhanceMenuImages(input: EnhanceMenuImagesInput): Promise<EnhanceMenuImagesOutput> {
  return enhanceMenuImagesFlow(input);
}

const enhanceMenuImagesFlow = ai.defineFlow(
  {
    name: 'enhanceMenuImagesFlow',
    inputSchema: EnhanceMenuImagesInputSchema,
    outputSchema: EnhanceMenuImagesOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.menuItemImage}},
        {text: 'enhance this image for display on a tablet, ensuring high quality and visibility'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    if (!media) {
      throw new Error('No enhanced image was generated.');
    }

    return {enhancedMenuItemImage: media.url!};
  }
);
