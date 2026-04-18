import { DataSource, EndpointDefinition, PropValue } from '../../schema/types';
import { resolvePropValue, Scope } from './bindingResolver';
import { resolveTemplateString } from '../state/expressionEvaluator';

export class DataSourceManager {
  constructor(private dataSources: Record<string, DataSource>) {}

  async callEndpoint(
    sourceId: string,
    endpointName: string,
    params: Record<string, PropValue>,
    scope: Scope
  ): Promise<unknown> {
    const source = this.dataSources[sourceId];
    if (!source) throw new Error(`Data source not found: ${sourceId}`);

    if (source.type === 'static') {
      return source.staticData;
    }

    if (source.type === 'rest') {
      const endpoint = source.endpoints?.[endpointName];
      if (!endpoint) throw new Error(`Endpoint not found: ${endpointName}`);
      return this.executeRestCall(source, endpoint, params, scope);
    }

    throw new Error(`Unsupported data source type: ${source.type}`);
  }

  private async executeRestCall(
    source: DataSource,
    endpoint: EndpointDefinition,
    params: Record<string, PropValue>,
    scope: Scope
  ): Promise<unknown> {
    const resolvedParams = Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, resolvePropValue(v, scope)])
    );

    const mergedScope = { ...scope, params: resolvedParams };
    const path = resolveTemplateString(endpoint.path, mergedScope);
    const url = `${source.baseUrl ?? ''}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...endpoint.headers,
    };

    const options: RequestInit = {
      method: endpoint.method,
      headers,
    };

    if (endpoint.body && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      const resolvedBody = Object.fromEntries(
        Object.entries(endpoint.body).map(([k, v]) => [k, resolvePropValue(v, mergedScope)])
      );
      options.body = JSON.stringify(resolvedBody);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (endpoint.responseMapping) {
      return getNestedValue(data, endpoint.responseMapping);
    }

    return data;
  }
}

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current != null && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}
