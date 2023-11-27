import { Component, OnInit } from '@angular/core';
import { FavoriteStallionsService, FavoriteStallions } from './favorite-stallions.service';


@Component({
  selector: 'app-favorite-stallions',
  templateUrl: './favorite-stallions.component.html',
  styleUrls: ['./favorite-stallions.component.css'],
  providers: []
})
export class FavoriteStallionsComponent implements OnInit {
  public favorites: Array<string> = [];

  constructor(
    private favoriteStallionsService: FavoriteStallionsService
    ) {}

  ngOnInit(): void {
    this.favoriteStallionsService.getFavorites()
    .subscribe((data: FavoriteStallions) => {
      this.favorites = data.favorite_stallions;
    })
  }
}
