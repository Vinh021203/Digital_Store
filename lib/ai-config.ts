import 'server-only';

import { createAdminClient } from '@/lib/supabase/server';

export const AI_MODEL_OPTIONS = [
  {
    id: 'deepseek/deepseek-v4-flash-free',
    label: 'DeepSeek V4 Flash Free',
    description: 'Nhanh, phù hợp chatbot tư vấn khách hàng hằng ngày.',
  },
  {
    id: 'deepseek/deepseek-v4-pro-free',
    label: 'DeepSeek V4 Pro Free',
    description: 'Phân tích sâu hơn cho tư vấn sản phẩm và recommendation.',
  },
] as const;

export type AIModelId = (typeof AI_MODEL_OPTIONS)[number]['id'];

const DEFAULT_MODEL: AIModelId = 'deepseek/deepseek-v4-flash-free';

export function isAIModelId(value: unknown): value is AIModelId {
  return AI_MODEL_OPTIONS.some((model) => model.id === value);
}

export async function getConfiguredAIModel(): Promise<AIModelId> {
  const envModel = process.env.ORCAROUTER_MODEL;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('site_settings')
      .select('value')
      .eq('key', 'ai_model')
      .maybeSingle();

    if (isAIModelId(data?.value)) return data.value;
  } catch (error) {
    console.warn('Unable to load AI model setting:', error);
  }

  if (isAIModelId(envModel)) return envModel;

  return DEFAULT_MODEL;
}

export function getDefaultAIModel(): AIModelId {
  return DEFAULT_MODEL;
}
