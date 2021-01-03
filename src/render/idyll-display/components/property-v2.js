import React from 'react';

// export const PropertyV2 = React.forwardRef((props, ref) => {
//     const {onPropBlur, variableData, updateProperty, name, propertyObject, activePropName, activePropInput } = props;
//     const [input, setInput] = React.useState('');

//     const isActiveProp = name === activePropName;

//     React.useEffect(() => {
//         if(isActiveProp) {
//             setInput(activePropInput)
//         } else {
//             setInput(propertyObject.value);
//         }
//     }, [])

//     const onFocus = () => {
//         props.onFocus(name);
//     }

//     const handleUpdateValue = (e) => {
//       let val = e.target.value;
//       if (val.trim() !== '') {
//         val = Number(e.target.value);
//       }
//       if (isNaN(val)) {
//         val = e.target.value;
//       }

//       updateProperty(name, val, e);
//     };

//     const getBackgroundColor = (propType) => {
//       switch (propType) {
//         case 'expression':
//           return '#B8E986';
//         case 'variable':
//           return '#50E3C2';
//         case 'value':
//           return '#4A90E2';
//       }
//     }

//     const getColor = (propType) => {
//       switch (propType) {
//         case 'expression':
//           return '#222';
//         case 'variable':
//           return '#222';
//         case 'value':
//           return '#fff';
//       }
//     }

//     /**
//      * Updates the prop type
//      * @param {string} propName the prop name
//      * @param {string} type the next type of the prop
//      */
//     const updateNodeType = (propName, type) => {
//       return (e) => {
//         this.props.updateNodeType(propName, type);
//       };
//     }

//     /**
//      * Renders an input for the corresponding
//      * prop name
//      * @param {string} key the prop name
//      * @param {string} prop the prop value
//      * @param {string} nextType the next prop type
//      */
//     const renderPropInput = (key, propertyObject, nextType) => {
//       return (
//         <div>
//           <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
//             <div
//               className={'prop-type'}
//               onClick={updateNodeType(key, nextType)}
//               style={{
//                 marginLeft: 0,
//                 // borderRadius: '0 20px 20px 0',
//                 background: getBackgroundColor(propertyObject.type),
//                 color: getColor(propertyObject.type)
//               }}
//             >
//               {propertyObject.type === 'value' ? typeof propertyObject.value : propertyObject.type}
//             </div>
//             <input
//               className={'prop-input'}
//               style={{ fontFamily: 'monospace' }}
//               type="text"
//               onBlur={onPropBlur}
//               onChange={handleUpdateValue}
//               value={input}
//             />
//           </div>

//           {/* If variable, display current value */}
//           {propertyObject.type === 'variable' ? (
//             <div className="current-value">Current Value: {variableData[propertyObject.value]}</div>
//           ) : (
//             <></>
//           )}
//         </div>
//       );
//     }

//     const renderProp = (key, propertyObject) => {
//       switch (propertyObject.type) {
//         case 'variable':
//           return renderPropInput(key, propertyObject, 'value');
//         case 'value':
//           return renderPropInput(key, propertyObject, 'expression');
//         case 'expression':
//           return renderPropInput(key, propertyObject, 'variable');
//       }
//     }

//     const ret = (
//         <div
//           style={{
//             marginLeft: 0,
//             // border: isOver ? 'solid 2px green' : undefined,
//           }}
//         >
//           <div className="prop-name">
//             {name}
//           </div>
//           <div>
//             {renderProp(name, propertyObject)}
//           </div>
//         </div>
//       );

//     return <div>
//     <input ref={isActiveProp ? ref : null} value={input} onChange={handleUpdateValue} onFocus={onFocus}/></div>;
// })

export const PropertyV2 = props => {
  const [input, setInput] = React.useState('');

  const handleChange = e => {
    const value = e.target.value;

    setInput(value);
    props.handleChange(props.node, props.name, value, e);
  };

  return <input value={input} onChange={handleChange} />;
};

//   const variableTarget = {
//     drop(props, monitor, component) {
//       console.log('dropped on property!!');
//       const name = monitor.getItem().name;
//       const node = props.node;

//       updateNodeById(props.ast, node.id, {
//         properties: { [props.name]: { value: name, type: 'variable' } },
//       });
//       props.setAst(props.ast);
//     },
//   };

//   function collect(connect, monitor) {
//     return {
//       dropTarget: connect.dropTarget(),
//       isOver: monitor.isOver(),
//     };
//   }

//   export const Property = DropTarget('VARIABLE', variableTarget, collect)(PropertyV2);
