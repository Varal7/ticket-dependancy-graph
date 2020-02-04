import go from 'gojs';

const GO = go.GraphObject.make;

window.myDiagram = GO(go.Diagram, 'dependencyGraph', {
  initialContentAlignment: go.Spot.Center,
  'undoManager.isEnabled': true,
  allowCopy: false,
  autoScale: go.Diagram.Uniform,
  layout: GO(go.LayeredDigraphLayout, { direction: 90, layerSpacing: 10 }),
});

window.myDiagram.nodeTemplate = GO(
  go.Node,
  'Auto',
  {
    isShadowed: true,
    shadowColor: '#C5C1AA',
    layoutConditions: go.Part.LayoutAdded,
  },
  {
    mouseDrop(e, node) {
      const { diagram } = node;
      const selnode = diagram.selection.first(); // assume just one Node in selection
      if (selnode instanceof go.Node) {
        window.graphHandler.addDependency(node.data.key, selnode.data.key);
        selnode.data.hasJustBeenLinked = true;
        // eslint-disable-next-line no-param-reassign
        node.isLayoutPositioned = true;
      }
    },
  },
  GO(go.Shape, 'RoundedRectangle', { strokeWidth: 1, fill: 'white' }),
  GO(
    go.Panel,
    'Horizontal',
    GO(go.Panel, 'Vertical', new go.Binding('itemArray', 'labels'), {
      itemTemplate: GO(
        go.Panel,
        'Auto',
        { margin: 2 },
        GO(
          go.Shape,
          'RoundedRectangle',
          { fill: '#91E3E0', stroke: null },
          new go.Binding('fill', 'color')
        ),
        GO(go.TextBlock, new go.Binding('text', 'name'), {
          margin: 1,
          font: 'bold 12px sans-serif',
          stroke: 'white',
        })
      ),
    }),
    GO(
      go.TextBlock,
      { margin: 12, font: 'bold 20px sans-serif' },
      new go.Binding('text', 'key')
    ),
    GO(
      go.TextBlock,
      { margin: 12, stroke: '#64AD35', font: 'bold 14px sans-serif' },
      new go.Binding('text', 'complexityEstimation')
    ),
    GO(
      go.TextBlock,
      { margin: 4, stroke: '#AD6935', font: 'bold 14px sans-serif' },
      new go.Binding('text', 'complexityReal')
    ),
    GO(
      go.TextBlock,
      {
        margin: 8,
        font: 'bold 10px sans-serif',
        width: 100,
        wrap: go.TextBlock.WrapFit,
      },
      new go.Binding('text', 'name')
    )
  )
);

// To be populated with Trello
const myModel = GO(go.GraphLinksModel);
myModel.nodeDataArray = [
  {
    key: 1,
    complexityEstimation: 13,
    complexityReal: 8,
    name: 'Connect to Trello to use the TDG',
    labels: [{ color: 'blue', name: 'connexion' }],
  },
  {
    key: 2,
    complexityEstimation: 5,
    complexityReal: 8,
    name: "Choose a board, a list, and you're good to go!",
    labels: [{ color: 'pink', name: 'actions' }],
  },
  {
    key: 3,
    complexityEstimation: null,
    complexityReal: 5,
    name:
      'You can add a link between two tickets given their id using the form below',
    labels: [{ color: 'pink', name: 'actions' }],
  },
  {
    key: 4,
    complexityEstimation: 1,
    complexityReal: 1,
    name:
      'Or you can use Drag&Drop: simply drag a ticket over a ticket it depends on',
    labels: [{ color: 'pink', name: 'actions' }],
  },
  {
    key: 5,
    complexityEstimation: 0.5,
    complexityReal: null,
    name:
      'To delete a link, select it with your mouse and press the Delete key',
    labels: [{ color: 'purple', name: 'tips' }],
  },
  {
    key: 6,
    complexityEstimation: null,
    complexityReal: null,
    name: 'Dependencies will be stored on your Trello board!',
    labels: [{ color: 'purple', name: 'tips' }],
  },
  { key: 7, complexityEstimation: null, complexityReal: null, name: 'Enjoy!' },
];

myModel.linkDataArray = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 5 },
  { from: 4, to: 5 },
];

window.myDiagram.linkTemplate = GO(
  go.Link,
  GO(go.Shape, { strokeWidth: 5, stroke: '#555' })
);

window.myDiagram.addDiagramListener('SelectionDeleting', e => {
  const part = e.subject.first(); // e.subject is the myDiagram.selection collection,
  // so we'll get the first since we know we only have one selection
  if (part instanceof go.Link) {
    const childId = part.toNode.data.key;
    const parentId = part.fromNode.data.key;
    window.trelloHandler.deleteTrelloDependency(parentId, childId);
  }
});

window.myDiagram.addDiagramListener('SelectionMoved', e => {
  e.subject.each(part => {
    if (part.data.hasJustBeenLinked) {
      part.data.hasJustBeenLinked = false; // eslint-disable-line no-param-reassign
      part.isLayoutPositioned = true; // eslint-disable-line no-param-reassign
    } else part.isLayoutPositioned = false; // eslint-disable-line no-param-reassign
  });
});

window.myDiagram.model = myModel;
