import 'should';
import should from 'should';
import crawlEntityPath from '../../../src/helpers/crawlEntityPath';

describe('crawlEntityPath', () => {
  // Helper to create folder/entity structure
  function makeEntity({ name, shortid, folderShortid, entitySet = 'templates' }) {
    return {
      name,
      shortid,
      __entitySet: entitySet,
      folder: folderShortid ? { shortid: folderShortid } : undefined
    };
  }

  const folders = [
    makeEntity({ name: 'A', shortid: 'f1', entitySet: 'folders' }),
    makeEntity({ name: 'B', shortid: 'f2', folderShortid: 'f1', entitySet: 'folders' }),
    makeEntity({ name: 'C', shortid: 'f3', folderShortid: 'f2', entitySet: 'folders' })
  ];

  const entities = [
    ...folders,
    makeEntity({ name: 'doc0', shortid: 't0'}),
    makeEntity({ name: 'doc1', shortid: 't1', folderShortid: 'f1' }),
    makeEntity({ name: 'doc2', shortid: 't2', folderShortid: 'f2' }),
    makeEntity({ name: 'doc3', shortid: 't3', folderShortid: 'f3' })
  ];

  it('should find itself', () => {
    const startingEntity = entities.find(e => e.shortid === 't1');

    const result = crawlEntityPath(entities, 'doc1', startingEntity);

    result.shortid.should.equal('t1');
  });

  it('should find entity in subfolder', () => {
    const startingEntity = entities.find(e => e.shortid === 't1');

    const result = crawlEntityPath(entities, 'B/doc2', startingEntity);

    result.shortid.should.equal('t2');
  });

  it('should find entity in nested subfolder', () => {
    const startingEntity = entities.find(e => e.shortid === 't1');

    const result = crawlEntityPath(entities, 'B/C/doc3', startingEntity);

    result.shortid.should.equal('t3');
  });

  it('should find entity using .. to go up', () => {
    const startingEntity = entities.find(e => e.shortid === 't3');

    const result = crawlEntityPath(entities, '../doc2', startingEntity);
    
    result.shortid.should.equal('t2');
  });

  it('should find entity using multiple .. to go up', () => {
    const startingEntity = entities.find(e => e.shortid === 't3');

    const result = crawlEntityPath(entities, '../../doc1', startingEntity);

    result.shortid.should.equal('t1');
  });

  it('should find entity using multiple .. to go up - to root', () => {
    const startingEntity = entities.find(e => e.shortid === 't3');

    const result = crawlEntityPath(entities, '../../../doc0', startingEntity);

    result.shortid.should.equal('t0');
  });

  it('should find entity using combination of .. and subfolders', () => {
    const startingEntity = entities.find(e => e.shortid === 't3');
    
    const result = crawlEntityPath(entities, '../../B/doc2', startingEntity);
    
    result.shortid.should.equal('t2');
  });

  it('should return null if path does not exist', () => {
    const startingEntity = entities.find(e => e.shortid === 't1');

    const result = crawlEntityPath(entities, 'NonExistent/docX', startingEntity);

    should(result).be.null();
  });

  it('should handle if starting entity is at root', () => {
    const rootEntity = entities.find(e => e.shortid === 't0');

    const result = crawlEntityPath(allEntities, 'A/doc1', rootEntity);

    result.shortid.should.equal('t1');
  });

  it('should handle going up to and down root', () => {
    const startingEntity = entities.find(e => e.shortid === 't1');

    const result = crawlEntityPath(allEntities, '../A/B/doc2', rootEntity);

    result.shortid.should.equal('t2');
  });

  it('should return null if .. is going above root', () => {
    const startingEntity = entities.find(e => e.shortid === 't1');

    const result = crawlEntityPath(entities, '../../docX', startingEntity);

    should(result).be.null();
  });

  it('should return null if no final path', () => {
    const startingEntity = entities.find(e => e.shortid === 't1');

    const result = crawlEntityPath(entities, 'B/', startingEntity);

    should(result).be.null();
  });

  it('should start at root if path starts with /', () => {
    const startingEntity = entities.find(e => e.shortid === 't3');

    const result = crawlEntityPath(entities, '/A/B/doc2', startingEntity);

    result.shortid.should.equal('t2');
  });
});