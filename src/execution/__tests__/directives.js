/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { expect } from 'chai';
import { execute } from '../execute';
import { describe, it } from 'mocha';
import { parse } from '../../language';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from '../../type';


var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'TestType',
    fields: {
      a: { type: GraphQLString },
      b: { type: GraphQLString },
    }
  }),
});

var data = {
  a() { return 'a'; },
  b() { return 'b'; }
};

async function executeTestQuery(doc) {
  return await execute(schema, parse(doc), data);
}

describe('Execute: handles directives', () => {
  describe('works without directives', () => {
    it('basic query works', async () => {
      expect(
        await executeTestQuery('{ a, b }')
      ).to.deep.equal({
        data: { a: 'a', b: 'b' }
      });
    });
  });

  describe('works on scalars', () => {
    it('if true includes scalar', async () => {
      return expect(
        await executeTestQuery('{ a, b @include(if: true) }')
      ).to.deep.equal({
        data: { a: 'a', b: 'b' }
      });
    });

    it('if false omits on scalar', async () => {
      return expect(
        await executeTestQuery('{ a, b @include(if: false) }')
      ).to.deep.equal({
        data: { a: 'a' }
      });
    });

    it('unless false includes scalar', async () => {
      return expect(
        await executeTestQuery('{ a, b @skip(if: false) }')
      ).to.deep.equal({
        data: { a: 'a', b: 'b' }
      });
    });

    it('unless true omits scalar', async () => {
      return expect(
        await executeTestQuery('{ a, b @skip(if: true) }')
      ).to.deep.equal({
        data: { a: 'a' }
      });
    });
  });

  describe('works on fragment spreads', () => {
    it('if false omits fragment spread', async () => {
      var q = `
        query Q {
          a
          ...Frag @include(if: false)
        }
        fragment Frag on TestType {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a' }
      });
    });

    it('if true includes fragment spread', async () => {
      var q = `
        query Q {
          a
          ...Frag @include(if: true)
        }
        fragment Frag on TestType {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a', b: 'b' }
      });
    });

    it('unless false includes fragment spread', async () => {
      var q = `
        query Q {
          a
          ...Frag @skip(if: false)
        }
        fragment Frag on TestType {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a', b: 'b' }
      });
    });

    it('unless true omits fragment spread', async () => {
      var q = `
        query Q {
          a
          ...Frag @skip(if: true)
        }
        fragment Frag on TestType {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a' }
      });
    });
  });

  describe('works on inline fragment', () => {
    it('if false omits inline fragment', async () => {
      var q = `
        query Q {
          a
          ... on TestType @include(if: false) {
            b
          }
        }
        fragment Frag on TestType {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a' }
      });
    });

    it('if true includes inline fragment', async () => {
      var q = `
        query Q {
          a
          ... on TestType @include(if: true) {
            b
          }
        }
        fragment Frag on TestType {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a', b: 'b' }
      });
    });
    it('unless false includes inline fragment', async () => {
      var q = `
        query Q {
          a
          ... on TestType @skip(if: false) {
            b
          }
        }
        fragment Frag on TestType {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a', b: 'b' }
      });
    });
    it('unless true includes inline fragment', async () => {
      var q = `
        query Q {
          a
          ... on TestType @skip(if: true) {
            b
          }
        }
        fragment Frag on TestType {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a' }
      });
    });
  });

  describe('works on fragment', () => {
    it('if false omits fragment', async () => {
      var q = `
        query Q {
          a
          ...Frag
        }
        fragment Frag on TestType @include(if: false) {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a' }
      });
    });
    it('if true includes fragment', async () => {
      var q = `
        query Q {
          a
          ...Frag
        }
        fragment Frag on TestType @include(if: true) {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a', b: 'b' }
      });
    });
    it('unless false includes fragment', async () => {
      var q = `
        query Q {
          a
          ...Frag
        }
        fragment Frag on TestType @skip(if: false) {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a', b: 'b' }
      });
    });
    it('unless true omits fragment', async () => {
      var q = `
        query Q {
          a
          ...Frag
        }
        fragment Frag on TestType @skip(if: true) {
          b
        }
      `;
      return expect(await executeTestQuery(q)).to.deep.equal({
        data: { a: 'a' }
      });
    });
  });
});
