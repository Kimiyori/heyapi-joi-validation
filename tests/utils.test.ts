import { describe, expect, test } from '@jest/globals';
import { Expression, NumericLiteral, StringLiteral, SyntaxKind } from 'typescript';

import { chainMethods, createLiteral, getResultAsString } from '@/compiler/utils/typeHelpers';

describe('createLiteral', () => {
  it('creates a string literal', () => {
    const value = 'hello';
    const result = createLiteral(value);
    expect(result.kind).toBe(SyntaxKind.StringLiteral);
    expect((result as StringLiteral).text).toBe(value);
  });

  it('creates a numeric literal', () => {
    const value = 42;
    const result = createLiteral(value);
    expect(result.kind).toBe(SyntaxKind.NumericLiteral);
    expect((result as NumericLiteral).text).toBe(String(value));
  });

  it('creates a true boolean literal', () => {
    const value = true;
    const result = createLiteral(value);
    expect(result.kind).toBe(SyntaxKind.TrueKeyword);
  });

  it('creates a false boolean literal', () => {
    const value = false;
    const result = createLiteral(value);
    expect(result.kind).toBe(SyntaxKind.FalseKeyword);
  });

  it('creates a null literal (default case)', () => {
    const value = undefined;
    const result = createLiteral(value);
    expect(result.kind).toBe(SyntaxKind.Identifier);
  });
});

describe('chainMethods', () => {
  // Helper function to assert the chained method string result
  const assertChainedMethod = (
    args: Array<[string, (string | number | Expression)[]] | string>,
    expected: string
  ) => {
    const result = chainMethods('joi', ...args);
    expect(getResultAsString(result)).toBe(expected);
  };

  // eslint-disable-next-line jest/expect-expect
  test('chains methods with no arguments', () => {
    assertChainedMethod(['string', 'required'], 'joi.string().required()');
  });

  // eslint-disable-next-line jest/expect-expect
  test('chains methods with primitive arguments', () => {
    assertChainedMethod([['string', [1, 2]], 'required'], 'joi.string(1, 2).required()');
  });

  // eslint-disable-next-line jest/expect-expect
  test('chains multiple methods', () => {
    assertChainedMethod(
      ['string', ['array', [1, 2]], 'required'],
      'joi.string().array(1, 2).required()'
    );
  });
});
