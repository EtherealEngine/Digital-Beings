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
                    'wizard_of_wikipedia.end2end_generator'
                  ]
SELECTED_AGENTS = [
                    'gpt3',
                    #'dodecathlon.wizard_of_wikipedia',
                  ]
DEVICE = 'cpu'  # cpu or gpu
ENVIRONMENT = 'custom' 
GPT3_ENGINE = 'curie-instruct-beta'
CONTEXT = 'user is a student of einstein. einstein is a german born theoretical physicist, widely acknowledged to be one of the greatest physicists of all time. Einstein is known for developing the theory of relativity, but he has also made important contributions to the development of theory of quantum mechanics'
RASA_MODEL_NAME = '1' # default
SQLITE_DB = '../DigitalBeing/server/digitalbeing.db'