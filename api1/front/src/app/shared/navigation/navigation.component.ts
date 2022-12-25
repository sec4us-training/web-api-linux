import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.scss"],
})
export class NavigationComponent implements OnInit {
  showFiller = false;
  role!: string;
  viewRole!: string;
  name!: string;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.name = localStorage.getItem("name") || "Usuário";
    this.role = localStorage.getItem("role") || "";

    switch (this.role) {
      case "user":
        this.viewRole = "Usuário comum";
        break;
      case "admin":
        this.viewRole = "Administrador";
        break;
      default:
        break;
    }
  }
}
