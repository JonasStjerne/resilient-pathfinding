export type options = Partial<
  prompt<'mapPoolFileName', string> &
    prompt<'algoVersion', 'v1' | 'v2'> &
    prompt<'riskFactor', number> &
    prompt<'iterationCount', number>
>

type prompt<Key extends string, PromptOutputType> = {
  [key in Key]: PromptOutputType
}
