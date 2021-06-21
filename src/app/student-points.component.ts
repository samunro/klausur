import { formatNumber } from "@angular/common";
import { Component, Inject, LOCALE_ID } from "@angular/core";
import { Exam } from "./Exam";
import { ExamDefinition } from "./ExamDefinition";
import master from "./master";
import { Mode } from "./Mode";
import { Modes } from "./modes";
import pointRanges from "./pointRanges";
import { SkillWeighting } from "./SkillWeighting";

@Component({
  selector: "student-points",
  templateUrl: "./student-points.component.html"
})
export class StudentPointsComponent {
  constructor(@Inject(LOCALE_ID) private locale: string){  }

  ngOnInit() {
    for (const mode of master.modes) {
      const examDefinitionMode: {
        id: number;
        isEnabled: boolean;
        weighting: number;
        skillWeightings: SkillWeighting[];
      } = { id: mode.id, isEnabled: mode.id === Modes.Schreiben, weighting: mode.weighting, skillWeightings: [] };

      this.examDefinition.modes.push(examDefinitionMode);

      const isSprachmittlung = mode.id === Modes.Sprachmittlung;

      const examMode = new Mode(examDefinitionMode.id);
      this.exam.modes.push(examMode);

      for (const part of master.parts) {
        for (const area of part.areas) {
          examMode.areaComments.push({ areaId: area.id, comment: null });

          const areSkillWeightingsFixed = this.areSkillWeightingsFixed(
            part.id,
            mode.id
          );

          const areaSkillWeightings: SkillWeighting[] = [];

          for (const skill of area.skills) {
            if (
              skill.shouldIncludeInSprachmittlung !== null &&
              skill.shouldIncludeInSprachmittlung !== isSprachmittlung
            )
              continue;

              examMode.skillPoints.push({ skillId: skill.id, points: null });

            areaSkillWeightings.push({
              skillId: skill.id,
              weighting: areSkillWeightingsFixed ? 100 / area.skills.length : 0,
              isWeightingFixed: areSkillWeightingsFixed,
              isIncluded: areSkillWeightingsFixed
            });

            for (const criteria of skill.criteria) {
              examMode.checkedCriteria.push({
                criteriaId: criteria.id,
                isChecked: false
              });
            }
          }

          areaSkillWeightings[0].weighting +=
            100 - this.sum(areaSkillWeightings.map(x => x.weighting));

          examDefinitionMode.skillWeightings.push(...areaSkillWeightings);
        }
      }
    }
  }

  master = master;
  pointRanges = pointRanges.items.sort((a, b) => a.minimum - b.minimum);

  private examDefinition = new ExamDefinition();
  private exam = new Exam();

  get modeName() {
    return this.master.modes.find(x => x.id === this.mode.id).name;
  }

  private get mode() {
    const modeId = this.isSprachmittlungSelected ? Modes.Sprachmittlung : Modes.Schreiben;

    return this.exam.modes.find(x => x.id === modeId);
  }

  get isSprachmittlungEnabled(){
    return this.getSprachmittlungMode().isEnabled;
  }

  private getSprachmittlungMode() {
    return this.examDefinition.modes.find(x => x.id === Modes.Sprachmittlung);
  }

  set isSprachmittlungEnabled(value: boolean) {
    if(!value) this.isSprachmittlungSelected = false;

    this.getSprachmittlungMode().isEnabled = value;
  }

  isSprachmittlungSelected = false;

  get isSchreibenSelected(){
    return !this.isSprachmittlungSelected;
  }

  set isSchreibenSelected(value: boolean){
    this.isSprachmittlungSelected = !value;
  }

  get sprachmittlungWeighting() {
    return this.getExamDefinitionMode(Modes.Sprachmittlung).weighting;
  }

  set sprachmittlungWeighting(value: number){
    this.getExamDefinitionMode(Modes.Sprachmittlung).weighting = value;
  }

  get schreibenWeighting(){
    return this.getExamDefinitionMode(Modes.Schreiben).weighting;
  }

  set schreibenWeighting(value: number) {
    this.getExamDefinitionMode(Modes.Schreiben).weighting = value;
  }

  private getExamDefinitionMode(mode: Modes) {
    return this.examDefinition.modes.find(x => x.id === mode);
  }

  get student() {
    return this.exam.student;
  }

  set student(value: string) {
    this.exam.student = value;
  }

  get teacher() {
    return this.examDefinition.teacher;
  }

  set teacher(value: string) {
    this.examDefinition.teacher = value;
  }

  get city() {
    return this.examDefinition.city;
  }

  set city(value: string) {
    this.examDefinition.city = value;
  }

  get school() {
    return this.examDefinition.school;
  }

  set school(value: string) {
    this.examDefinition.school = value;
  }

  get course() {
    return this.examDefinition.course;
  }

  set course(value: string) {
    this.examDefinition.course = value;
  }

  get examType() {
    return this.examDefinition.type;
  }

  set examType(value: string) {
    this.examDefinition.type = value;
  }

  isPrintView = false;

  getFormattedPointsForSkill(skillId: number, modeId: number = null){
    const points = this.getPointsForSkill(skillId, modeId);

    if(points === null) return "?";

    return points;
  }

  getPointsForSkill(skillId: number, modeId: number = null) {
    return this.getSkillPoints(skillId, modeId).points;
  }

  setPointsForSkill(points: number, skillId: number) {
    this.getSkillPoints(skillId).points = points;
  }

  getSkillPoints(skillId: number, modeId: number = null) {
    const mode =
      modeId === null ? this.mode : this.exam.modes.find(x => x.id === modeId);

    return mode.skillPoints.find(x => x.skillId === skillId);
  }

  isCriteriaChecked(criteriaId: number, modeId: number = null) {
    return this.getCheckedCriteria(criteriaId, modeId).isChecked;
  }

  toggleCriteria(criteriaId: number, skillId: number) {
    const checkedCriteria = this.getCheckedCriteria(criteriaId);

    checkedCriteria.isChecked = !checkedCriteria.isChecked;

    const skillPoints = this.getSkillPoints(skillId);

    skillPoints.points = this.calculatePointsForSkill(skillId);
  }

  private getCheckedCriteria(criteriaId: number, modeId: number = null) {
    const mode =
      modeId === null ? this.mode : this.exam.modes.find(x => x.id === modeId);

    return mode.checkedCriteria.find(x => x.criteriaId === criteriaId);
  }

  getSkill(skillId: number) {
    for (const part of this.master.parts) {
      for (const area of part.areas) {
        const skill = area.skills.find(x => x.id === skillId);

        if (skill) return skill;
      }
    }

    throw Error(`Skill with id ${skillId} was not found.`);
  }

  calculatePointsForSkill(skillId: number) {
    const criteria = this.getSkill(skillId).criteria;

    let criteriaPoints: number[] = [];

    for (const criterion of criteria) {
      const checkedCriteria = this.getCheckedCriteria(criterion.id);

      if (!checkedCriteria.isChecked) continue;

      const pointRange = this.pointRanges.find(
        x => x.id === criterion.pointRangeId
      );

      criteriaPoints.push((pointRange.minimum + pointRange.maximum) / 2);
    }

    if(criteriaPoints.length === 0) return null;

    return Math.round(this.average(criteriaPoints));
  }

  private average(elements: number[]) {
    const sum = this.sum(elements);

    return sum / elements.length;
  }

  private sum(elements: number[]) {
    return elements.reduce((a, b) => a + b, 0);
  }

  private getArea(areaId: number) {
    for (const part of this.master.parts) {
      const area = part.areas.find(x => x.id === areaId);

      if (area) return area;
    }

    throw Error(`Could not find the ares with id ${areaId}.`);
  }

  getFormattedAreaPoints(areaId: number){
    const points = this.getPointsForArea(areaId);

    if(points === null) return "?";

    return formatNumber(points, this.locale, "1.2-2")
  }

  getPointsForArea(areaId: number, modeId: number = null) {
    const skillIds = this.getAreaSkillWeightings(areaId, modeId).filter(x => x.isIncluded).map(x => x.skillId);

    const pointsAndWeightings = skillIds.map(x => {return {points: this.getPointsForSkill(x, modeId), weighting: this.getSkillWeighting(x, modeId)}});

    if(pointsAndWeightings.some(x => x.points === null)) return null;

    return this.sum(
      pointsAndWeightings.map(x => x.points * x.weighting / 100)
    );
  }

  getSkillsForArea(areaId: number, modeId: number = null) {
    const mode =
      modeId === null ? this.mode : this.exam.modes.find(x => x.id === modeId);

    const skillIds = mode.skillPoints.map(x => x.skillId);

    const area = this.getArea(areaId);

    return area.skills.filter(x => skillIds.includes(x.id));
  }

  getFormattedPointsForPart(partId: number, modeId: number = null) {
    const points = this.getPointsForPart(partId, modeId);

    if(points === null) return "?";

    return points;
  }

  getPointsForPart(partId: number, modeId: number = null) {
    const part = this.master.parts.find(x => x.id === partId);

    const points: number[] = [];

    for (const area of part.areas) {
      points.push(this.getPointsForArea(area.id, modeId));
    }

    if(points.includes(null)) return null;

    return Math.round(this.average(points));
  }

  getCriteria(skillId: number, pointRangeId: number) {
    for (const part of this.master.parts) {
      for (const area of part.areas) {
        const skill = area.skills.find(x => x.id === skillId);

        if (skill)
          return skill.criteria.filter(x => x.pointRangeId === pointRangeId);
      }
    }

    throw Error(`Could not find the skill with id ${skillId}.`);
  }

  getModes() {
    if (!this.isSprachmittlungEnabled) {
      return this.master.modes.filter(x => x.id === 1);
    } else {
      return this.master.modes;
    }
  }

  get examDefinitionModes(){
    return this.getModes().map(mode => this.examDefinition.modes.find(examDefinitionMode => examDefinitionMode.id === mode.id));
  }

  getFormattedTotalPoints(){
    const points = this.getTotalPoints();

    if(points === null) return "?";

    return formatNumber(points, this.locale, "1.0-0");
  }

  getTotalPoints() {
    var modes = this.examDefinitionModes;

    var totalWeightings = this.sum(modes.map(x => x.weighting));

    const pointsAndWeightings = modes.map(x => {return {points: this.getPointsForMode(x.id), weighting: x.weighting}});

    if(pointsAndWeightings.some(x => x.points === null)) return null;

    return (
      this.sum(
        pointsAndWeightings.map(x => x.weighting * x.points)
      ) / totalWeightings
    );
  }

  getFormattedPointsForMode(modeId: number = null){
    const points = this.getPointsForMode(modeId);

    if(points === null) return "?";

    return points;
  }

  getPointsForMode(modeId: number = null) {
    let result = 0;

    for (const part of master.parts) {
      const points = this.getPointsForPart(part.id, modeId);

      if(points === null) return null;

      result += (part.weighting / 100) * this.getPointsForPart(part.id, modeId);
    }

    return Math.round(result);
  }

  getSkillWeighting(skillId: number, modeId: number = null) {
    return this.getSkillWeightingObject(skillId, modeId).weighting;
  }

  setSkillWeighting(value: number, skillId: number) {
    if (value > 100) {
      value = 100;
    } else if (value < 0) {
      value = 0;
    }

    this.getSkillWeightingObject(skillId, this.mode.id).weighting = value;
  }

  private getSkillWeightingObjects(modeId: number) {
    modeId = modeId || this.mode.id;

    return this.examDefinition.modes.find(
      x => x.id === (modeId || this.mode.id)
    ).skillWeightings;
  }

  private getSkillWeightingObject(skillId: number, modeId: number) {
    return this.getSkillWeightingObjects(modeId).find(
      x => x.skillId === skillId
    );
  }

  isSkillIncluded(skillId: number) {
    return this.getSkillWeightingObject(skillId, this.mode.id).isIncluded;
  }

  setSkillIncluded(value: boolean, skillId: number) {
    this.getSkillWeightingObject(skillId, this.mode.id).isIncluded = value;
  }

  getTotalAreaWeightings(areaId: number) {
    const weightings = this.getIncludedAreaSkillWeightings(areaId).map(
      x => x.weighting
    );

    return this.sum(weightings);
  }

  getAreaSkillsCount(areaId: number) {
    return this.getIncludedAreaSkillWeightings(areaId).length;
  }

  getIncludedAreaSkillWeightings(areaId: number, modeId: number = null) {
    return this.getAreaSkillWeightings(areaId, modeId).filter(
      x => x.isIncluded
    );
  }

  private getAreaSkillWeightings(areaId: number, modeId: number = null) {
    modeId = modeId || this.mode.id;

    const isSprachmittlung = modeId === 2;

    const skillIds = this.getSkillsForArea(areaId, modeId)
      .filter(
        x =>
          x.shouldIncludeInSprachmittlung === null ||
          x.shouldIncludeInSprachmittlung === isSprachmittlung
      )
      .map(x => x.id);

    return this.getSkillWeightingObjects(modeId).filter(x =>
      skillIds.includes(x.skillId)
    );
  }

  getComment(areaId: number, modeId: number = null) {
    return this.getAreaComment(areaId, modeId).comment;
  }

  setComment(value: string, areaId: number) {
    this.getAreaComment(areaId).comment = value;
  }

  private getAreaComment(areaId: number, modeId: number = null) {
    const mode =
      modeId === null ? this.mode : this.exam.modes.find(x => x.id === modeId);

    return mode.areaComments.find(x => x.areaId === areaId);
  }

  getCheckCriteriaForSkill(skillId: number, modeId: number = null) {
    return this.getSkill(skillId)
      .criteria.filter(x => this.isCriteriaChecked(x.id, modeId))
      .map(x => x.text);
  }

  saveExamDefinition() {
    this.download(this.examDefinition, "Klausur Definition.json");
  }

  async loadExamDefinition(event: Event) {
    const content = await (event.target as HTMLInputElement).files[0].text();

    this.examDefinition = JSON.parse(content);

    this.setDefaultModeWeighting(2, Modes.Schreiben);
    this.setDefaultModeWeighting(1, Modes.Sprachmittlung);
  }

  private setDefaultModeWeighting(weighting: number, mode: Modes) {
    const modeObject = this.examDefinition.modes.find(x => x.id === mode);

    modeObject.weighting = modeObject.weighting || weighting;
  }

  saveExam() {
    this.download(this.exam, "Klausur.json");
  }

  async loadExam(event: Event) {
    const content = await (event.target as HTMLInputElement).files[0].text();

    this.exam = JSON.parse(content);
  }

  private download(data: object, filename, type = "application/json") {
    var file = new Blob([JSON.stringify(data)], { type: type });
    if (window.navigator.msSaveOrOpenBlob)
      // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else {
      // Others
      var a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  get year() {
    return new Date().getUTCFullYear();
  }

  get date() {
    return new Date().toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric",
      day: "numeric"
    });
  }

  areSkillWeightingsFixed(partId: number, modeId: number = null) {
    const isSprachmittlung =
      modeId !== null ? modeId === Modes.Sprachmittlung : this.isSprachmittlungSelected;

    if (isSprachmittlung) return true;

    return partId !== 1; //Inhalt;
  }
}