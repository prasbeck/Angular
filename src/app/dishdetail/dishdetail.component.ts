import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSlider } from '@angular/material';
import { visibility } from '../animations/app.animation';
import { flyInOut, expand } from '../animations/app.animation';





@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
   // tslint:disable-next-line:use-host-property-decorator
   host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      visibility(),
      expand()
    ]
})

export class DishdetailComponent implements OnInit {

 @ViewChild('fform') commentFormDirective;

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  dishErrMess: string;
  dishcopy: Dish;
  visibility= 'shown';

  commentForm : FormGroup;

  formErrors = {
    'author': '',
    'comment': ''
  };
  validationMessages = {
    'author': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':   'Comment is required'
    }
  };


  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb : FormBuilder,
    @Inject('BaseURL') private BaseURL) { }

    ngOnInit() {
      this.createForm();
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds,
        disherrmess => this.dishErrMess = <any>disherrmess);
        this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); }))
        .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
          disherrmess => this.dishErrMess = <any>disherrmess);
    }

  goBack(): void {
    this.location.back();
  }
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
  createForm(){
    this.commentForm = this.fb.group({
      rating: 5,
      comment: ['',Validators.required],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      date:''     
    });
    
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
  
    this.onValueChanged(); // (re)set validation messages now
  }
  onSubmit(){
    let d = new Date();
    this.commentForm.value.date = d.toISOString();
    this.dishcopy.comments.push(this.commentForm.value);
    console.log(this.commentForm.value);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      disherrmess => { this.dish = null; this.dishcopy = null; this.dishErrMess = <any>disherrmess; });
    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      rating: 5,
      comment:'',
      author:'',
      date:''
    });
    }
  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

}
  
 


