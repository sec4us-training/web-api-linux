import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
})
export class ToolbarComponent {
  @Input() pageTitle = "";

  constructor(private router: Router, private authService: AuthService) {}

  signout(): void {
    this.authService.signout();
  }
}
