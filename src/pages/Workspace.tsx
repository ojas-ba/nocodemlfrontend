import DatasetPreview from "./DatasetPreview";
import VisualizeDataSet from "./VisualizeDataSet";
import TrainModel from "./TrainModel";
import { useState } from "react";


export default function Workspace() {
    const [columns, setColumns] = useState<string[]>([]);
    //const [file_url, setFileUrl] = useState<string>("");
    //const [datasetName, setDatasetName] = useState<string>("");
    const [numericalColumns, setNumericalColumns] = useState<string[]>([]);
    const [categoricalColumns, setCategoricalColumns] = useState<string[]>([]);

    return (
        <>
                {/* setFileUrl and setDatasetName are commented out */}
                <DatasetPreview setColumns={setColumns} setCategoricalColumns={setCategoricalColumns} setNumericalColumns={setNumericalColumns} />
                <VisualizeDataSet columns={columns}/>
                <TrainModel numericalColumns={numericalColumns} categoricalColumns={categoricalColumns}/>
        </>

    );
}