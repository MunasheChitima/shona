type PrerequisiteEdge = {
  unitId: string
  requiresUnitId: string
}

export type UnitStatus = 'locked' | 'available' | 'completed' | 'current'

export function evaluateUnitPrerequisites(
  unitId: string,
  prerequisites: PrerequisiteEdge[],
  completedUnitIds: Set<string>
): { satisfied: boolean; missingUnitIds: string[] } {
  const required = prerequisites
    .filter((p) => p.unitId === unitId)
    .map((p) => p.requiresUnitId)

  const missingUnitIds = required.filter((requiredUnitId) => !completedUnitIds.has(requiredUnitId))
  return {
    satisfied: missingUnitIds.length === 0,
    missingUnitIds
  }
}

export function resolveUnitStatuses(
  orderedUnits: { id: string }[],
  completedUnitIds: Set<string>,
  currentUnitId: string | null,
  prerequisites: PrerequisiteEdge[]
): Record<string, UnitStatus> {
  const statuses: Record<string, UnitStatus> = {}

  for (const unit of orderedUnits) {
    if (completedUnitIds.has(unit.id)) {
      statuses[unit.id] = 'completed'
      continue
    }

    if (currentUnitId && unit.id === currentUnitId) {
      statuses[unit.id] = 'current'
      continue
    }

    const { satisfied } = evaluateUnitPrerequisites(unit.id, prerequisites, completedUnitIds)
    statuses[unit.id] = satisfied ? 'available' : 'locked'
  }

  return statuses
}

/** When the user has not started the path, the first unit is browsable as `available` (plan default). */
export function promoteFirstUnitWhenNoEnrollment(
  statuses: Record<string, UnitStatus>,
  orderedUnitIds: string[],
  hasEnrollment: boolean,
  completedUnitIds: Set<string>
): void {
  if (hasEnrollment || orderedUnitIds.length === 0) return
  const firstId = orderedUnitIds[0]
  if (!completedUnitIds.has(firstId) && statuses[firstId] !== 'completed') {
    statuses[firstId] = 'available'
  }
}
