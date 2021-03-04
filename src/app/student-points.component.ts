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
      for(const skill of area.skills){
        this.skillGrades.push({ grade: 0, skillId: skill.id });
      }
    }
  }

  criteria = criteria;
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
}

class SkillGrade {
  skillId: number;
  grade: number;
}
