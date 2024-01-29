import { Component, Input, OnInit } from '@angular/core';
import { FavoriteStallionBoxService, FavoriteStallionprofile } from './favorite-stallion-box.service';
import { FavoriteStallionsService } from '../favorite-stallions.service';
import { objectStorageBaseUrl, photosPrefix } from 'src/environments/environment';

@Component({
  selector: 'app-favorite-stallion-box',
  templateUrl: './favorite-stallion-box.component.html',
  styleUrls: ['./favorite-stallion-box.component.css'],
  providers: [
    FavoriteStallionBoxService
  ]
})
export class FavoriteStallionBoxComponent implements OnInit{
  @Input() stallionId: string = "";

  public objectStorageBaseUrl = objectStorageBaseUrl;
  public photosPrefix = photosPrefix;

  public name: string = "";
  public breed: string = "";
  public profilePicture: string = "";
  public profileStatus: string = "";

  public isFavorite: boolean = true;

  public profileNotVisibleErrorIsDisplayed: boolean = false;

  constructor(
    private favoriteStallionBoxService: FavoriteStallionBoxService,
    private favoriteStallionsService: FavoriteStallionsService
  ) {}

  ngOnInit(): void {
    console.log(this.stallionId)
    if (this.stallionId) {
      this.favoriteStallionBoxService.getStallionThumbnailProfite(this.stallionId)
      .subscribe((data: FavoriteStallionprofile) => {
        this.name = data.name;
        this.breed = data.breed;
        this.profileStatus = data.profile_status;
        this.profilePicture = data.thumbnail_photo;
      })
    }
  }

  updateFavorite() {
    if (this.stallionId) {
      if (this.isFavorite) {
        this.favoriteStallionsService.removeFromFavorites(this.stallionId)
        .subscribe(() => this.isFavorite = false);
      } else {
        this.favoriteStallionsService.addToFavorites(this.stallionId)
        .subscribe(() => this.isFavorite = true);
      }
    }
  }

  goToStallionProfile() {
    if (this.profileStatus == "visible") {
      const url = `/stallion-profile?id=${this.stallionId}`;
      window.open(url, '_blank');
    } else {
      this.profileNotVisibleErrorIsDisplayed = true;
    }
  }
}
