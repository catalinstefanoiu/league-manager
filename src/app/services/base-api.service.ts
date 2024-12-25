import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';

const API_URL = 'https://europe-central2-leaguemanager-39205.cloudfunctions.net/api';

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