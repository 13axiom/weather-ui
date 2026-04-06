/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',  // поддержка TS + JSX + JS
  testEnvironment: 'jsdom',              // для React компонентов
  setupFilesAfterEnv: ['@testing-library/jest-dom'], // jest-dom матчеры
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',         // алиасы @/ → корень проекта
    '\\.(css|scss|sass)$': 'identity-obj-proxy', // стили
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest', // трансформация TS/TSX/JSX
  },
  transformIgnorePatterns: ['/node_modules/', '/.next/'], // игнорируем лишние папки
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
}