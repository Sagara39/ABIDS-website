'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating compelling menu item descriptions.
 *
 * - generateMenuItemDescription - A function that takes menu item details and generates a description.
 * - MenuItemInput - The input type for the generateMenuItemDescription function.
 * - MenuItemOutput - The return type for the generateMenuItemDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MenuItemInputSchema = z.object({
  name: z.string().describe('The name of the menu item.'),
  ingredients: z.string().describe('A comma-separated list of the key ingredients in the menu item.'),
  preparation: z.string().describe('A brief description of how the menu item is prepared.'),
  uniqueSellingPoints: z.string().describe('A comma-separated list of the unique selling points of the menu item.'),
});
export type MenuItemInput = z.infer<typeof MenuItemInputSchema>;

const MenuItemOutputSchema = z.object({
  description: z.string().describe('A compelling and descriptive text for the menu item.'),
});
export type MenuItemOutput = z.infer<typeof MenuItemOutputSchema>;

export async function generateMenuItemDescription(input: MenuItemInput): Promise<MenuItemOutput> {
  return generateMenuItemDescriptionFlow(input);
}

const generateMenuItemDescriptionPrompt = ai.definePrompt({
  name: 'generateMenuItemDescriptionPrompt',
  input: {schema: MenuItemInputSchema},
  output: {schema: MenuItemOutputSchema},
  prompt: `You are a marketing expert specializing in writing enticing descriptions for menu items.

  Given the following information about a menu item, generate a compelling and descriptive text that will entice customers.
  Highlight the key ingredients, preparation methods, and unique selling points.

  Menu Item Name: {{{name}}}
  Key Ingredients: {{{ingredients}}}
  Preparation Method: {{{preparation}}}
  Unique Selling Points: {{{uniqueSellingPoints}}}
  `,
});

const generateMenuItemDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMenuItemDescriptionFlow',
    inputSchema: MenuItemInputSchema,
    outputSchema: MenuItemOutputSchema,
  },
  async input => {
    const {output} = await generateMenuItemDescriptionPrompt(input);
    return output!;
  }
);
