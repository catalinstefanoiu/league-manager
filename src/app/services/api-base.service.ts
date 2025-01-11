import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';
import { environment } from '../../environments/environment';

const API_URL = environment.api_base;

export interface IHttpOptions {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?: {
    includeHeaders?: string[];
  } | boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApiBaseService {
  private logger = inject(LoggerService);
  private authSvc = inject(AuthService);
  private http = inject(HttpClient);

  protected async getRequest<T>(path: string, params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  }): Promise<T> {
    const url = `${API_URL}${path}`;
    const httpOptions = await this.getHttpOptions();
    if (params) {
      httpOptions.params = params;
    }
    return lastValueFrom(this.http.get<T>(url, httpOptions));
  }

  protected async postRequest<T>(path: string, body: unknown): Promise<T> {
    const url = `${API_URL}${path}`;
    const httpOptions = await this.getHttpOptions();
    return lastValueFrom(this.http.post<T>(url, body, httpOptions));
  }

  protected async putRequest<T>(path: string, body: unknown): Promise<T> {
    const url = `${API_URL}${path}`;
    const httpOptions = await this.getHttpOptions();
    return lastValueFrom(this.http.put<T>(url, body, httpOptions));
  }

  private async getHttpOptions(): Promise<IHttpOptions> {
    const token = await this.authSvc.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };

    return httpOptions;
  }
}