import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources';
import React from 'react';
import { ChatCompletionMessageOrReactElement, Tools } from './chat-completion';
import z from 'zod';
export declare function filterOutReactComponents(messages: ChatCompletionMessageOrReactElement[]): ChatCompletionMessageParam[];
export declare function sleep(ms: number): Promise<void>;
export declare function toolsToJsonSchema(tools: Tools<{
    [toolName: string]: z.Schema;
}>): ChatCompletionTool[];
export declare function isReactElement(message: ChatCompletionMessageOrReactElement): message is React.ReactElement;
export declare function isAsyncGeneratorFunction(fn: unknown): fn is AsyncGenerator;
