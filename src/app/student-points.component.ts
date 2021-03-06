import { Component } from "@angular/core";
import master from "./master.json";
import pointRanges from "./pointRanges.json";

@Component({
  selector: "student-points",
  templateUrl: "./student-points.component.html"
})
export class StudentPointsComponent {
  ngOnInit() {
    for (const part of master.parts) {
      for (const area of part.areas) {
        for (const skill of area.skills) {
          this.skillPoints.push({skillId: skill.id, points: 0});

          for (const criteria of skill.criteria){
            this.checkedCriteria.push({
              criteriaId: criteria.id,
              isChecked: false
            });
          }
        }
      }
    }
  }

  master = master;
  pointRanges = pointRanges.items;

  checkedCriteria: CheckedCriteria[] = [];
  skillPoints: SkillPoints[] = [];

  getPointsForSkill(skillId: number) {
    return this.getSkillPoints(skillId).points;
  }

  setPointsForSkill(points: number, skillId: number) {
    this.getSkillPoints(skillId).points = points;
  }

  private getSkillPoints(skillId: number) {
    return this.skillPoints.find(x => x.skillId === skillId);
  }

  isCriteriaChecked(criteriaId: number) {
    return this.getCheckedCriteria(criteriaId).isChecked;
  }

  checkCriteria(isChecked: boolean, criteriaId: number, skillId: number) {
    this.getCheckedCriteria(criteriaId).isChecked = isChecked;

    const skillPoints = this.getSkillPoints(skillId);

    skillPoints.points = this.calculatePointsForSkill(skillId);
  }

  private getCheckedCriteria(criteriaId: number){
    return this.checkedCriteria.find(x => x.criteriaId === criteriaId);
  }

  private getSkill(skillId: number) {
    for(const part of this.master.parts){
      for(const area of part.areas){
        const skill = area.skills.find(x => x.id === skillId);

        if(skill) return skill;
      }
    }

    throw Error(`Skill with id ${skillId} was not found.`);
  }

  calculatePointsForSkill(skillId: number) {
    const criteria = this.getSkill(skillId).criteria;

    let criteriaPoints: number[] = [];

    for(const criterion of criteria){
      const checkedCriteria = this.getCheckedCriteria(criterion.id);

      if(!checkedCriteria.isChecked) continue;

      const pointRange = this.pointRanges.find(x => x.id === criterion.pointRangeId);

      criteriaPoints.push((pointRange.minimum + pointRange.maximum) / 2);
    }

    return Math.round(this.average(criteriaPoints));
  }

  private average(elements: number[]) {
    const sum = this.sum(elements);

    return sum / elements.length;
  }

  private sum(elements: number[]) {
    return elements.reduce((a, b) => a + b, 0);
  }

  private getArea(areaId: number){
    for(const part of this.master.parts){
      const area = part.areas.find(x => x.id === areaId);

      if(area) return area;
    }

    throw Error(`Could not find the ares with id ${areaId}.`)
  }

  getPointsForArea(areaId: number) {
    const area = this.getArea(areaId);

    return this.average(area.skills.map(x => this.getPointsForSkill(x.id)));
  }

  getPointsForPart(partId: number) {
    const part = this.master.parts.find(x => x.id === partId);

    const points: number[] = [];

    for(const area of part.areas){
      points.push(this.getPointsForArea(area.id));
    }

    return Math.round(
      this.average(points)
    );
  }

  getCriteria(skillId: number, pointRangeId: number) {
    for(const part of this.master.parts){
      for(const area of part.areas){
        const skill = area.skills.find(x => x.id === skillId);

        if(skill) return skill.criteria.filter(x => x.pointRangeId === pointRangeId);
      }
    }

      throw Error(`Could not find the skill with id ${skillId}.`);
  }
}

class CheckedCriteria {
  criteriaId: number;
  isChecked: boolean;
}

class SkillPoints {
  skillId: number;
  points: number;
}
