declare var exports: {
  oxmysql: {
    single<T = any>(query: string, params?: any[]): Promise<T | null>
    query<T = any[]>(query: string, params?: any[]): Promise<T>
    execute(query: string, params?: any[]): Promise<number>
    insert(query: string, params?: any[]): Promise<number>
    update(query: string, params?: any[]): Promise<number>
    scalar<T = any>(query: string, params?: any[]): Promise<T>
  }
  [key: string]: any
}
