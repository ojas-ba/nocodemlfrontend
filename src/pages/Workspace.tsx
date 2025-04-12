import DatasetPreview from "./DatasetPreview";
import ModelBuilder from "./ModelBuilder";
import Preprocessing from "./Preprocessing";
import VisualizeDataSet from "./VisualizeDataSet";
import { useState } from "react";


export default function Workspace() {
    const [columns, setColumns] = useState<string[]>([]);
    const [file_url, setFileUrl] = useState<string>("");
    const [datasetName, setDatasetName] = useState<string>("");
    const [numericalColumns, setNumericalColumns] = useState<string[]>([]);
    const [categoricalColumns, setCategoricalColumns] = useState<string[]>([]);

    return (
        <>
                <DatasetPreview setColumns={setColumns} setFileUrl={setFileUrl} setDatasetName={setDatasetName} setCategoricalColumns={setCategoricalColumns} setNumericalColumns={setNumericalColumns} />
                <VisualizeDataSet columns={columns}/>
                <Preprocessing file_url={file_url} datasetName={datasetName} columns={columns} numericalColumns={numericalColumns} categoricalColumns={categoricalColumns} />
                <ModelBuilder columns={columns} />
        </>

    );
}