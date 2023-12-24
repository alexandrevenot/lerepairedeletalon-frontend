import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Review, Reviews, ReviewsService } from './reviews.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
  providers: [
    ReviewsService
  ]
})
export class ReviewsComponent implements OnInit{

  // route params
  public userId: string = "";
  public reviewPov: string = ""; // given or received
  public coverPov: string = ""; // seller or buyer
  public stallionNSIRE: string = "";

  // boolean to display only one stallion or all
  public displayOnlyOneStallion: boolean = false;

  // reviews with all stallions
  public reviews: Array<any> = [];
  public averageScore: number = 0;

  // reviews with only one stallion
  public filteredReviews: Array<any> = [];
  public filteredAverageScore: number = 0;

  // interaction with backend
  public reviewsHaveBeenFetched: boolean = false;

  // owner name
  public firstname: string = "";
  public lastname: string = "";
  public nameHasBeenFetched: boolean = false;

  // stallion name
  public stallionName: string = "";
  public stallionNameHasBeenFetched: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private reviewsService: ReviewsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['id'];
      this.reviewPov = params['reviewPov'];
      this.coverPov = params['coverPov'];
      this.stallionNSIRE = params['stallionNSIRE'];

      if (this.userId && ["given", "received"].includes(this.reviewPov) && ["buyer", "seller"].includes(this.coverPov)) {
        this.reviewsService.getReviews(
          this.userId,
          this.reviewPov,
          this.coverPov
        )
        .subscribe((reviewsJSON: Reviews) => {
          reviewsJSON.reviews.forEach((review: Review) => {
            if (!this.nameHasBeenFetched) {
              if (this.reviewPov == "given") {
                this.firstname = review.reviewer_firstname;
                this.lastname = review.reviewer_lastname;
              } else {
                this.firstname = review.reviewed_firstname;
                this.lastname = review.reviewed_lastname;
              }
              this.nameHasBeenFetched = true;
            }

            if (
              !this.stallionNameHasBeenFetched
              && this.stallionNSIRE
              && this.coverPov === "seller"
              && this.reviewPov === "received"
              && review.stallion_nsire == this.stallionNSIRE
              ) {
                this.displayOnlyOneStallion = true;
                this.stallionName = review.stallion_name;
                this.stallionNameHasBeenFetched = true;
            }

            this.reviews.push({
              "stallionName": review.stallion_name,
              "stallionNSIRE": review.stallion_nsire,
              "reviewedFirstname": review.reviewed_firstname,
              "reviewedLastname": review.reviewed_lastname,
              "reviewerFirstname": review.reviewer_firstname,
              "reviewerLastname": review.reviewer_lastname,
              "content": review.content,
              "score": review.score,
              "writingDate": review.writing_date
            })
          })

          const scoreSum = this.reviews.reduce((sum, object) => sum + object["score"], 0);
          this.averageScore = Math.floor(scoreSum * 10 / this.reviews.length) / 10;

          if (this.stallionNSIRE) {
            this.filteredReviews = this.reviews.filter((review) => review["stallionNSIRE"] === this.stallionNSIRE);
            const filteredNoteSum = this.filteredReviews.reduce((sum, object) => sum + object["score"], 0);
            if (this.filteredReviews.length > 0) {
              this.filteredAverageScore = Math.floor(filteredNoteSum * 10 / this.filteredReviews.length) / 10;
            }
          }
          this.reviewsHaveBeenFetched = true;
        })
      }
    });
  }

  getReviewsToDisplay() {
    if (this.displayOnlyOneStallion) {
      return this.filteredReviews;
    } else {
      return this.reviews;
    }
  }

  switchDisplaymode(value: 'full' | 'filtered') {
    value === 'full' ? this.displayOnlyOneStallion = false: this.displayOnlyOneStallion = true;
  }
}
