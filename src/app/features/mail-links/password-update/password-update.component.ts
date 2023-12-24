import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { backendInteractionStatus } from 'src/environments/environment';
import { PasswordUpdateService } from './password-update.service';

@Component({
  selector: 'app-password-update',
  templateUrl: './password-update.component.html',
  styleUrls: ['./password-update.component.css'],
  providers: [PasswordUpdateService]
})
export class PasswordUpdateComponent implements OnInit{
  public code: string = "";
  public status: Record<string, backendInteractionStatus> = {"value": backendInteractionStatus.Init};
  public newPassword1 = new FormControl('');
  public newPassword2 = new FormControl('');

  public labels: Record<string, string> = {
    "Init": "",
    "Loading": "",
    "UserError": "Les mots de passe ne correspondent pas, ou bien sont vides.",
    "BackendError": "Une erreur est survenue. C'est probablement de notre côté, nous sommes désolés. Veuillez réessayer s'il vous plaît.",
    "Success": "Le mot de passe a été mis à jour avec succès."
  }

  constructor (
    private route: ActivatedRoute,
    private passwordUpdateService: PasswordUpdateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.code = params['code'];
    })
  }

  updatePassword() {
    const newPassword1 = this.newPassword1.getRawValue();
    const newPassword2 = this.newPassword2.getRawValue();

    if (!newPassword1 || !newPassword2 || newPassword1 != newPassword2) {
      this.status["value"] = backendInteractionStatus.UserError;
      return;
    }

    this.passwordUpdateService.updatePassword(
      this.code,
      newPassword1,
      this.status
    )
    .subscribe(() => {
      this.status["value"] = backendInteractionStatus.Success
    })
  }
}
