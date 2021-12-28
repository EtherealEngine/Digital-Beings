ALL_AGENTS_LIST = [
                    'blender.small',
                    'blender_large',
                    'blender.xlarge',
                    'blender.xxlarge',
                    'unlikelihood.convai2.vocab.alpha.1e-1',
                    'dialogpt.small',
                    'dialogpt.medium',
                    'dialogpt.large',
                    'dodecathlon.all_tasks_mt',
                    'dodecathlon.convai2',
                    'dodecathlon.daily_dialog',
                    'dodecathlon.wizard_of_wikipedia',
                    'gptneo.large',
                    'gptneo.small',
                    'gptneo.xlarge',
                    'reddit.xlarge',
                    'reddit.xxlarge',
                    'wizard_of_wikipedia.end2end_generator',
                    'gpt3',
                    'repeat',
                    'metaintelligence',
                    'thales'
                  ]
SELECTED_AGENTS = [
                    # 'gpt3',
                    #'repeat'
                    'metaintelligence'
                    #'thales'
                    #'dodecathlon.wizard_of_wikipedia',
                  ]
DEVICE = 'cpu'  # cpu or gpu
ENVIRONMENT = 'custom' 
GPT3_ENGINE = 'curie-instruct-beta'
RASA_MODEL_NAME = '1' # default
JSON_FILE = 'server/digitalbeing.json'