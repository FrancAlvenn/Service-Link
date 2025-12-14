export interface FeatureFlags {
  ENABLE_FILE_ATTACHMENTS: boolean;
}

export function useFeatureFlags(): FeatureFlags;

export default function FeatureFlagsProvider(props: {
  children: React.ReactNode;
  flags?: Partial<FeatureFlags>;
}): JSX.Element;

