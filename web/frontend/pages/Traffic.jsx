import React from 'react'
import TableComponent from '../components/TableComponent.jsx';

const Traffic = () => {

    const userData = [
        { id: 1, name: "Alice Johnson", email: "mailto:alice@example.com", referenceKey: "ref123" },
        { id: 2, name: "Bob Smith", email: "mailto:bob@example.com", referenceKey: "ref456" },
        { id: 3, name: "Charlie Brown", email: "mailto:charlie@example.com", referenceKey: "ref789" },
      ];
  return (
  <>
     <div class="w-full text-center text-4xl font-bold mb-3">
      TRAFFIC
  </div> 
     
     <TableComponent users={userData}/>
  </>
  )
}
export default Traffic;
