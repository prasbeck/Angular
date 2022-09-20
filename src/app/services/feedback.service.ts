import { Injectable } from '@angular/core';
import { Feedback, ContactType } from '../shared/feedback';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError} from 'rxjs/operators';
import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private http : HttpClient,
    private processHTTPMsgService : ProcessHTTPMsgService) { }

  submitFeedback(feedback : Feedback): Observable<Feedback>{
    const httpOptions = {
      headers: new HttpHeaders({
        'content-Type': 'application/json'
      })
    };
    return this.http.post<Feedback>(baseURL + 'feedback', feedback, httpOptions)
    .pipe(catchError(this.processHTTPMsgService.handleError));
  }
}
