import {Component, Input, OnInit} from '@angular/core';
import {Result, Survey, SurveyService} from "../survey.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: []
})
export class SurveyComponent implements OnInit {
  @Input() surveyId : string;
  answersForm: FormGroup;
  survey : Survey;
  showResults: boolean;
  results: Result[];
  submitCount: number;

  constructor(private surveyService: SurveyService, private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.surveyService.getSurvey(this.surveyId).subscribe((survey: Survey) => {
      this.survey = survey;
      this.answersForm = this.buildForm();
    });
  }

  buildForm() {
    let answers = [];
    this.survey.questions.forEach(item => {
      if (item.type === "MultipleSelection") {
        let choices = [];

        item.choices.forEach(choice => {
          choices.push(this.formBuilder.group({
            'id': choice.id,
            'answer': false
          }));
        });

        answers.push(this.formBuilder.group({
          'questionId': item.id,
          'type': item.type,
          'choices': this.formBuilder.array(choices)
        }))
      } else if (item.type === "Text"){
        answers.push(this.formBuilder.group({
          'questionId': item.id,
          'type': item.type,
          'answer': ""
        }))
      } else {
        answers.push(this.formBuilder.group({
          'questionId': item.id,
          'type': item.type,
          'answer': ["", Validators.required]
        }))
      }
    });

    return this.formBuilder.group({
      'answers': this.formBuilder.array(answers)
    });
  }

  onViewResults(){
    this.surveyService.getCount(this.surveyId).subscribe(result => {
      this.submitCount = result.count;
      this.showResults = true;
    });
  }

  onDone(result){
    let answerList = [];
    result.answers.forEach((answer) => {
      if(answer.type === "MultipleSelection"){
        answer.choices.forEach(choice => {
          if(choice.answer){
            answerList.push({
              "questionId": answer.questionId,
              "answer": choice.id
            })
          }
        });
      } else if (answer.answer){
        answerList.push(answer)
      }
    });

    this.surveyService.setAnswers(this.surveyId,  answerList).subscribe(() => {
      // Update and view the results
      this.onViewResults();
    });
  }
}
