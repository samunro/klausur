import { Component } from "@angular/core";
import criteria from "./criteria.json";
import content from "./content.json";
import pointRanges from "./pointRanges.json";

@Component({
  selector: "student-points",
  templateUrl: "./student-points.component.html"
})
export class StudentPointsComponent {
  ngOnInit() {
    for (const area of criteria.areas) {
      for(const skill of area.skills){
        this.skillGrades.push({ grade: 0, skillId: skill.id, pointRangeIds: [] });
      }
    }
  }

  criteria = criteria;
  content = content;
  pointRanges = pointRanges.items;

  skillGrades: SkillGrade[] = [];

  getGrade(skillId: number){
    return this.getSkillGrade(skillId).grade;
  }

  setGrade(grade: number, skillId: number){
    console.dir("setting grade");
    this.getSkillGrade(skillId).grade = grade;
  }

  private getSkillGrade(skillId: number){
    return this.skillGrades.find(x => x.skillId === skillId);
  }

  isCriteriaChecked(pointRangeId: number, skillId: number){
    const skill = this.getSkillGrade(skillId);

    return skill.pointRangeIds.includes(pointRangeId);
  }

  checkCriteria(isChecked: boolean, pointRangeId: number, skillId: number){
    const skill = this.getSkillGrade(skillId);

    if(!isChecked) {
      skill.pointRangeIds = skill.pointRangeIds.filter(x => x !== pointRangeId);
    }
    else
    {
      if(!skill.pointRangeIds.includes(pointRangeId)){
        skill.pointRangeIds.push(pointRangeId);
      }
    }

    this.setGrade(this.calculatedGrade(skillId), skillId);
  }

  calculatedGrade(skillId: number){
    const skill = this.getSkillGrade(skillId);

    if(!skill.pointRangeIds.length) return 0;

    const averagePointGrades = this.pointRanges.filter(x => skill.pointRangeIds.includes(x.id)).map(x => (x.minimum + x.maximum)/2)

    return Math.round(this.average(averagePointGrades));
  }

  private average(elements: number[]){
    const sum = this.sum(elements);

    return sum / elements.length;
  }

  private sum(elements: number[]){
    return elements.reduce((a, b) => a + b, 0);
  }

  getGradeForArea(areaId: number){
    const area = this.criteria.areas.find(x => x.id === areaId);

    return this.average(area.skills.map(x => this.getGrade(x.id)));
  }

  getTotalGrade(){
    return Math.round(this.average(this.criteria.areas.map(x => this.getGradeForArea(x.id))));
  }

  getContentCriteria(skillId: number, pointRangeId: number){
    return this.content.skills.find(x => x.id === skillId).criteria.filter(x => x.pointRangeId === pointRangeId);
  }
}

class SkillGrade {
  skillId: number;
  grade: number;
  pointRangeIds: number[];
}