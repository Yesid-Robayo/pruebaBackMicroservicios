import { Config } from 'jest';

const config: Config = {
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',  
  },
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',  
  },
  testEnvironment: 'node',  
};

export default config;
