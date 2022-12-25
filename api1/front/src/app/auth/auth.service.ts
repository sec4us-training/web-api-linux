import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { SigninResponse } from "../shared/models/signin-response";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private basePath = environment.apiUrl + "/users";
  private loggedIn = new BehaviorSubject<boolean>(false);

  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  get isLoggedIn(): Observable<boolean> {
    const token = localStorage.getItem("jwt");

    if (!token) {
      this.loggedIn.next(false);
    } else {
      this.loggedIn.next(true);
    }

    return this.loggedIn.asObservable();
  }

  constructor(private http: HttpClient, private router: Router) {}

  signin(payload: {
    email: string;
    password: string;
  }): Observable<SigninResponse> {
    const url = this.basePath + "/authenticate";

    return this.http.post<SigninResponse>(url, payload);
  }

  verifyEmail(email: string): Observable<{ email_validated: boolean }> {
    const url = this.basePath + "/verify/" + email;

    return this.http.get<{ email_validated: boolean }>(url);
  }

  recoveryPassword(payload: {
    email: string;
  }): Observable<{ message: string }> {
    const url = this.basePath + "/recovery-password";

    return this.http.post<{ message: string }>(url, payload);
  }

  authenticate(): void {
    this.loggedIn.next(true);
  }

  signout(): void {
    localStorage.removeItem("auth");
    localStorage.removeItem("jwt");
    localStorage.removeItem("id");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("photo");
    localStorage.removeItem("phone");
    localStorage.removeItem("role");

    this.loggedIn.next(false);
    this.router.navigate(["/signin"]);
  }
}
