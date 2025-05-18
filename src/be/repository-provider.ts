import {DatabaseSync} from "node:sqlite";
import {createClassicRepo} from "@/be/classic-repository";
import {AppointmentRepository} from "@/domain/appointment";
import {createEsRepo} from "@/be/es/repository";

const db = new DatabaseSync('./db.sqlite');

const classicRepository = createClassicRepo(db)
const esRepository = createEsRepo(db)

export type RepositoryType = 'classic' | 'es'

export const getRepository = (type: RepositoryType): AppointmentRepository => {
    if (type === 'es') {
        return esRepository
    }
    return classicRepository
}

const createTestData = async (repo: AppointmentRepository) => {
    db.exec('CREATE TABLE IF NOT EXISTS migration (id string, repo string)');
    const alreadyRan = db.prepare("SELECT * FROM migration WHERE repo = ?").get(repo.constructor.name);
    if (!!alreadyRan) {
        return
    }

    await repo.create({ doctorId: 'Dr. Dolittle', ownerId: 'Ivan', dateTime: new Date('2025-03-01 10:00'), petName: 'Po'}, 'Ivan')

    const confirmed = await repo.create({ doctorId: 'Dr. Dolittle', ownerId: 'Ivan', dateTime: new Date('2025-03-12 14:00'), petName: 'Shifu'}, 'Ivan')
    confirmed.changeStatus('confirmed', 'Dr. Dolittle')
    await repo.save(confirmed)

    const rescheduledAndCancelled = await repo.create({ doctorId: 'Dr. Dolittle', ownerId: 'Ivan', dateTime: new Date('2025-04-12 14:00'), petName:  'Oogway'}, 'Ivan')
    rescheduledAndCancelled.changeDate(new Date('2025-04-13 14:00'), 'Ivan')
    rescheduledAndCancelled.changeDate(new Date('2025-04-17 11:45'), 'Dr. Dolittle')
    rescheduledAndCancelled.changeStatus('cancelled', 'Ivan')
    await repo.save(rescheduledAndCancelled)


    const axl = await repo.create({ doctorId: 'Dr. Amosov', ownerId: 'Buzz McCallister', dateTime: new Date('2025-05-12 14:00'), petName: 'Axl'}, 'Buzz McCallister');
    axl.changeDate(new Date('2025-06-13 15:30'), 'Buzz McCallister');
    axl.changeDate(new Date('2025-06-14 11:00'), 'Dr. Amosov');
    axl.changeDate(new Date('2025-06-14 12:15'), 'Buzz McCallister');
    axl.changeStatus('confirmed', 'Dr. Amosov');
    await repo.save(axl)

    db.prepare('INSERT INTO migration (id, repo) VALUES (?, ?)').run(crypto.randomUUID(), repo.constructor.name)
}

createTestData(classicRepository)
createTestData(esRepository)