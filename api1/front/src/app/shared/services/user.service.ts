import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { User } from "../models/user";

import { environment } from "../../../environments/environment";

interface UserApi {
  email: string;
  name: string;
  photo: string;
  phone: string;
  password: string;
  conf_password: string;
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private basePath = environment.apiUrl + "/users";

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    const url = this.basePath + "/list";

    return this.http.get<User[]>(url);
  }

  getUser(id: string): Observable<User> {
    const url = this.basePath + "/" + id;

    return this.http.get<User>(url);
  }

  createUser(user: User): Observable<any> {
    const url = this.basePath + "/create";

    return this.http.post<any>(url, user);
  }

  updateUser(id: string, payload: any): Observable<any> {
    const url = this.basePath + "/" + id;

    return this.http.patch(url, payload);
  }

  uploadPhoto(id: string, payload: { file: string | ArrayBuffer | null }): Observable<any> {
    const url = this.basePath + "/" + id + "/profile";

    return this.http.post(url, payload);
  }
}
