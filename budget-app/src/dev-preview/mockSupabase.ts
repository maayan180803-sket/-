import { supabase } from '../lib/supabaseClient';
import { FIXTURE_USER, FIXTURES } from './fixtures';

interface Filter {
  column: string;
  value: unknown;
}

class FakeQuery {
  private table: string;
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private filters: Filter[] = [];
  private single = false;

  constructor(table: string) {
    this.table = table;
  }

  select() {
    this.op = 'select';
    return this;
  }
  insert() {
    this.op = 'insert';
    return this;
  }
  update() {
    this.op = 'update';
    return this;
  }
  delete() {
    this.op = 'delete';
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }
  is(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }
  order() {
    return this;
  }
  maybeSingle() {
    this.single = true;
    return this.exec();
  }

  private exec() {
    const rows = (FIXTURES[this.table] ?? []) as Record<string, unknown>[];
    const matched = rows.filter((row) => this.filters.every((f) => row[f.column] === f.value));
    if (this.op === 'select') {
      const data = this.single ? matched[0] ?? null : matched;
      return Promise.resolve({ data, error: null });
    }
    return Promise.resolve({ data: null, error: null });
  }

  then<T>(resolve: (value: { data: unknown; error: null }) => T) {
    return this.exec().then(resolve);
  }
}

export function installMockSupabase() {
  // This entire object is intentionally loosely typed: it swaps the real
  // Supabase client methods for fixture-backed stand-ins, used only by the
  // no-backend visual preview build (preview.html), never in production.
  const mock = supabase as unknown as Record<string, any>;
  mock.auth.getSession = async () => ({
    data: { session: { user: FIXTURE_USER } },
  });
  mock.auth.onAuthStateChange = () => ({
    data: { subscription: { unsubscribe() {} } },
  });
  mock.from = (table: string) => new FakeQuery(table);
  mock.channel = () => ({ on: () => ({ subscribe: () => ({}) }) });
  mock.removeChannel = () => {};
}
