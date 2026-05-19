import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GithubUser } from '../models/github-user.model';

@Injectable({ providedIn: 'root' })
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.github.com/users';

  getUser(username: string): Observable<GithubUser> {
    return this.http.get<GithubUser>(`${this.baseUrl}/${username}`);
  }
}
