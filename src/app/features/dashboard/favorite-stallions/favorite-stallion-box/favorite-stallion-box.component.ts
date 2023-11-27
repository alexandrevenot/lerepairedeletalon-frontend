import { Component, Input, OnInit } from '@angular/core';
import { PhotosService } from 'src/environments/photos';
import { FavoriteStallionBoxService, FavoriteStallionprofile } from './favorite-stallion-box.service';
import { FavoriteStallionsService, FavoriteStallions } from '../favorite-stallions.service';

@Component({
  selector: 'app-favorite-stallion-box',
  templateUrl: './favorite-stallion-box.component.html',
  styleUrls: ['./favorite-stallion-box.component.css'],
  providers: [
    FavoriteStallionBoxService,
    PhotosService
  ]
})
export class FavoriteStallionBoxComponent implements OnInit{
  @Input() stallionId: string = "";

  public name: string = "";
  public breed: string = "";
  public profilePicture: string = "";
  public profileStatus: string = "";

  public isFavorite: boolean = true;

  public profileNotVisibleErrorIsDisplayed: boolean = false;

  constructor(
    private favoriteStallionBoxService: FavoriteStallionBoxService,
    private favoriteStallionsService: FavoriteStallionsService,
    private photosService: PhotosService
  ) {}

  ngOnInit(): void {
    console.log(this.stallionId)
    if (this.stallionId) {
      this.favoriteStallionBoxService.getStallionThumbnailProfite(this.stallionId)
      .subscribe((data: FavoriteStallionprofile) => {
        this.name = data.name;
        this.breed = data.breed;
        this.profileStatus = data.profile_status;
        this.photosService.getPhoto(data.thumbnail_photo)
        .subscribe(response => {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.profilePicture = reader.result as string
          }
          reader.readAsDataURL(response);
        })
        
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
