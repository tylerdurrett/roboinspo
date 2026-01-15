import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierRecommended,
  {
    ignores: ['.velite/**'],
  },
]

export default eslintConfig
