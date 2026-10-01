import { describe, expect, it } from 'vitest'
import {
  HOMEWORK_PATH,
  PROJECTS_PATH,
  buildDrive,
  displayPath,
  folderTitle,
  nearest,
  parent,
  resolve,
} from './fileSystem'

const drive = buildDrive({
  projects: [
    { slug: 'a', name: 'Alpha', description: ['Alpha'] },
    { slug: 'b', name: 'Alpha', description: ['Second Alpha'] },
  ],
  degrees: [{ slug: 'bsc', name: 'Bachelor_of_Science', status: 'Completed' }],
  certifications: [{ slug: 'cert', name: 'Cyber_Cert' }],
})

describe('buildDrive', () => {
  it('puts My Projects and Homework at the root', () => {
    expect(drive.children.map((c) => [c.type, c.name])).toEqual([
      ['folder', 'My Projects'],
      ['folder', 'Homework'],
    ])
  })

  it('splits Homework into Degrees and Certifications', () => {
    expect(resolve(drive, HOMEWORK_PATH).children.map((c) => [c.type, c.name])).toEqual([
      ['folder', 'Degrees'],
      ['folder', 'Certifications'],
    ])
    expect(resolve(drive, [...HOMEWORK_PATH, 'Certifications']).children.map((c) => c.name)).toEqual([
      'Cyber_Cert',
    ])
  })

  it('gives each entry a folder of its files', () => {
    const bsc = resolve(drive, [...HOMEWORK_PATH, 'Degrees', 'Bachelor_of_Science'])
    expect(bsc.children[0]).toMatchObject({ name: 'README.txt', text: 'Status: Completed' })
  })

  it('makes folder names unique within their parent', () => {
    expect(resolve(drive, PROJECTS_PATH).children.map((c) => c.name)).toEqual([
      'Alpha',
      'Alpha (2)',
    ])
  })

  it('skips entries with no name and tolerates missing lists', () => {
    const d = buildDrive({ projects: [{ slug: 'x' }] })
    expect(resolve(d, PROJECTS_PATH).children).toEqual([])
    expect(resolve(d, [...HOMEWORK_PATH, 'Degrees']).children).toEqual([])
    expect(resolve(d, [...HOMEWORK_PATH, 'Certifications']).children).toEqual([])
  })
})

describe('resolve', () => {
  it('returns the root for the empty path', () => {
    expect(resolve(drive, [])).toBe(drive)
  })

  it('returns null for a missing folder or a path through a file', () => {
    expect(resolve(drive, ['Nope'])).toBeNull()
    expect(resolve(drive, [...PROJECTS_PATH, 'Alpha', 'README.txt'])).toBeNull()
  })
})

describe('paths', () => {
  it('parent drops the last segment and stays at the root', () => {
    expect(parent(['Homework', 'X'])).toEqual(['Homework'])
    expect(parent([])).toEqual([])
  })

  it('nearest walks up to the closest folder that still exists', () => {
    expect(nearest(drive, ['Homework', 'Gone'])).toEqual(['Homework'])
    expect(nearest(drive, ['Gone', 'Deeper'])).toEqual([])
    expect(nearest(drive, PROJECTS_PATH)).toEqual(PROJECTS_PATH)
  })

  it('displays as a C: path and titles the window by folder', () => {
    expect(displayPath([])).toBe('C:\\')
    expect(displayPath(['Homework', 'X'])).toBe('C:\\Homework\\X')
    expect(folderTitle([])).toBe('(C:)')
    expect(folderTitle(['Homework', 'X'])).toBe('X')
  })
})
