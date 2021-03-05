import { Component } from "@angular/core";
import criteria from "./criteria.json";

@Component({
  selector: "student-points",
  templateUrl: "./student-points.component.html"
})
export class StudentPointsComponent {
  ngOnInit() {
    const skills = criteria.areas.map(x => x.skills);

    console.dir(skills[1].length);

    for (const area of criteria.areas) {
      this.areaWeights.push({areaId: area.id, weight: 100/criteria.areas.length})

      for(const skill of area.skills){
        this.skillGrades.push({ grade: 0, skillId: skill.id, pointRangeIds: [] });
      }
    }
  }

  criteria = criteria;
  skillGrades: SkillGrade[] = [];
  areaWeights: AreaWeight[] = [];

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

    const averagePointGrades = this.criteria.pointRanges.filter(x => skill.pointRangeIds.includes(x.id)).map(x => (x.minimum + x.maximum)/2)

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

    return this.sum(area.skills.map(x => this.getGrade(x.id)));
  }

  getTotalAreaWeights(){
    return this.sum(this.areaWeights.map(x => x.weight));
  }
  getAreaWeight(areaId: number) {
    return this.getAreaWeightObject(areaId).weight;
  }

  setAreaWeight(weight: number, areaId: number){
    const areaWeight = this.getAreaWeightObject(areaId);

    areaWeight.weight = weight;
  }

  private getAreaWeightObject(areaId: number){
    return this.areaWeights.find(x => x.areaId === areaId);
  }

  getTotalGrade(){
    return this.sum(this.criteria.areas.map(x => this.getGradeForArea(x.id) * this.getAreaWeight(x.id)/100));
  }
}

class SkillGrade {
  skillId: number;
  grade: number;
  pointRangeIds: number[];
}

class AreaWeight {
  areaId: number;
  weight: number;
}
