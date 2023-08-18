from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient


# sample document

def analyze(file_path):
    document_analysis_client = DocumentAnalysisClient(
            endpoint="https://mtformrec.cognitiveservices.azure.com/", credential=AzureKeyCredential("f70b29038cb54c228d2a1d944237405c")
        )
    
    with open(file_path, "rb") as f:
        poller = document_analysis_client.begin_analyze_document("prebuilt-document", document=f)
    result = poller.result()


    return result.content
        
    




    # print("----Key-value pairs found in document----")
    # for kv_pair in result.key_value_pairs:
    #     if kv_pair.key and kv_pair.value:
    #         print("Key '{}': Value: '{}'".format(kv_pair.key.content, kv_pair.value.content))
    #     else:
    #         print("Key '{}': Value:".format(kv_pair.key.content))

    # print("----------------------------------------")
